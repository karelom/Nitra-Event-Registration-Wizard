<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { fetchSessions } from "src/api/sessions";
import { fetchAddons } from "src/api/addons";
import { fetchEvent } from "src/api/event";
import { ADDON_CATEGORY_LABELS } from "src/api/addons";
import type { Addon } from "src/api/addons";
import type { Session } from "src/api/sessions";
import type { TicketType } from "src/api/event";
import type { AddonSelection } from "src/schemas/Step3Addons";
import { useRegistration, isVip } from "src/stores/registration";
import AppTabs from "src/components/shared/AppTabs.vue";
import AddonCard from "src/components/RegistrationWizard/steps/AddonCard.vue";
import { formatCurrency } from "src/lib/utils";

const registration = useRegistration();
const sessions = ref<Session[]>([]);
const addons = ref<Addon[]>([]);
const ticketTypes = ref<TicketType[]>([]);
const loading = ref(true);

onMounted(async () => {
  const [sess, adds, ev] = await Promise.all([
    fetchSessions(),
    fetchAddons(),
    fetchEvent(),
  ]);
  sessions.value = sess;
  addons.value = adds;
  ticketTypes.value = ev.ticketTypes;
  loading.value = false;
});

/** Addons grouped by category. */
const addonsByCategory = computed(() => {
  const groups = new Map<string, Addon[]>();
  for (const a of addons.value) {
    if (!groups.has(a.category)) groups.set(a.category, []);
    groups.get(a.category)!.push(a);
  }
  return groups;
});

const tabOptions = computed(() =>
  [...addonsByCategory.value.keys()].map((key) => ({
    value: key,
    label:
      ADDON_CATEGORY_LABELS[key as keyof typeof ADDON_CATEGORY_LABELS] ?? key,
  })),
);

const _activeTab = ref("");
const activeTab = computed({
  get: () => _activeTab.value || tabOptions.value[0]?.value || "",
  set: (v: string) => {
    _activeTab.value = v;
  },
});

const activeItems = computed(
  () => addonsByCategory.value.get(activeTab.value) ?? [],
);

const showShippingBanner = computed(() =>
  activeTab.value === 'merchandise' && selectedAddonDetails.value.some(({ addon }) => addon.maxQuantity !== undefined),
);

const selectedSessions = computed(() =>
  sessions.value.filter((s) => registration.selectedSessionIds.includes(s.id)),
);

/** True if this timed addon's slot overlaps any selected session. */
function hasConflict(addon: Addon): boolean {
  if (!addon.date || !addon.endDate) return false;
  return selectedSessions.value.some(
    (s) => addon.date! < s.endDate && addon.endDate! > s.date,
  );
}

// ── Store operations ──────────────────────────────────────────────

function getSelection(id: string): AddonSelection | undefined {
  return registration.selectedAddons.find((a) => a.id === id);
}

function isSelected(id: string): boolean {
  return registration.selectedAddons.some((a) => a.id === id);
}

function getSize(id: string): string {
  return getSelection(id)?.size ?? "";
}

function getQuantity(id: string): number {
  return getSelection(id)?.quantity ?? 0;
}

function toggleAddon(addon: Addon): void {
  const idx = registration.selectedAddons.findIndex((a) => a.id === addon.id);
  if (idx >= 0) {
    registration.selectedAddons.splice(idx, 1);
  } else {
    registration.selectedAddons.push({
      id: addon.id,
      category: addon.category,
      quantity: 1,
    });
  }
}

function setSize(id: string, size: string): void {
  const sel = getSelection(id);
  if (sel) sel.size = size;
}

function setQuantity(id: string, qty: number): void {
  if (qty === 0) {
    const idx = registration.selectedAddons.findIndex((a) => a.id === id);
    if (idx >= 0) registration.selectedAddons.splice(idx, 1);
  } else {
    const sel = getSelection(id);
    if (sel) {
      sel.quantity = qty;
    } else {
      const addon = addons.value.find((a) => a.id === id);
      if (addon)
        registration.selectedAddons.push({
          id,
          category: addon.category,
          quantity: qty,
        });
    }
  }
}

// ── Order summary ─────────────────────────────────────────────────

const currentTicket = computed(() =>
  ticketTypes.value.find((t) => t.id === registration.attendeeInfo.ticketId),
);

const selectedAddonDetails = computed(() =>
  registration.selectedAddons
    .map((sel) => ({ sel, addon: addons.value.find((a) => a.id === sel.id) }))
    .filter(
      (item): item is { sel: AddonSelection; addon: Addon } => !!item.addon,
    ),
);

const timedAddonDiscount = computed(() => {
  if (!isVip.value) return 0;
  return selectedAddonDetails.value
    .filter(({ addon }) => addon.date && addon.endDate)
    .reduce((sum, { addon, sel }) => sum + addon.price * sel.quantity * 0.1, 0);
});

const orderTotal = computed(() => {
  const ticketPrice = currentTicket.value?.price ?? 0;
  const addonsTotal = selectedAddonDetails.value.reduce(
    (sum, { addon, sel }) => sum + addon.price * sel.quantity,
    0,
  );
  return ticketPrice + addonsTotal - timedAddonDiscount.value;
});
</script>

<template>
  <div class="flex gap-8 py-10 px-[120px]">
    <!-- ── Add-ons list ── -->
    <div class="flex flex-col gap-6 flex-1 min-w-0">
      <h2 class="text-h3 text-neutral m-0">Select Add-ons</h2>

      <AppTabs :options="tabOptions" v-model="activeTab" />

      <!-- Shipping info banner (merchandise tab) -->
      <div
        v-if="showShippingBanner"
        class="flex gap-3 p-4 rounded-lg bg-info-subtle-rest border border-info-opacity"
      >
        <q-icon name="info" size="20px" class="text-info shrink-0 mt-px" />
        <div class="flex flex-col gap-1">
          <span class="text-sm font-semibold text-neutral leading-5"
            >Shipping Information</span
          >
          <span class="text-sm text-neutral leading-5">
            Merchandise items will be shipped to your address one week before
            the conference. Please ensure your shipping address in Step 1 is
            correct.
          </span>
        </div>
      </div>

      <!-- Loading skeleton -->
      <template v-if="loading">
        <div
          v-for="n in 3"
          :key="n"
          class="h-32 rounded-[6px] bg-surface-l2 animate-pulse"
        />
      </template>

      <!-- Addon cards -->
      <template v-else>
        <AddonCard
          v-for="addon in activeItems"
          :key="addon.id"
          :addon="addon"
          :selected="isSelected(addon.id)"
          :size="getSize(addon.id)"
          :quantity="getQuantity(addon.id)"
          :is-conflict="hasConflict(addon)"
          @toggle="toggleAddon(addon)"
          @update:size="setSize(addon.id, $event)"
          @update:quantity="setQuantity(addon.id, $event)"
        />
      </template>
    </div>

    <!-- ── Order Summary sidebar ── -->
    <div class="w-[380px] shrink-0 self-start sticky top-8">
      <div
        class="flex flex-col gap-4 p-6 rounded-[6px] bg-surface-l2 border border-solid border-neutral-muted"
      >
        <p class="text-subtitle1 m-0 text-neutral">Order Summary</p>

        <!-- Ticket line -->
        <div
          v-if="currentTicket"
          class="flex justify-between items-center gap-4"
        >
          <span class="text-xs text-neutral-muted"
            >{{ currentTicket.name }} Ticket</span
          >
          <span class="text-xs text-neutral-muted shrink-0">{{
            formatCurrency(currentTicket.price)
          }}</span>
        </div>
        <p v-else-if="!loading" class="text-xs text-neutral-quiet m-0 italic">
          No ticket selected
        </p>

        <!-- Selected addon lines -->
        <div
          v-for="{ addon, sel } in selectedAddonDetails"
          :key="addon.id"
          class="flex justify-between items-start gap-4"
        >
          <span class="text-xs text-neutral-muted">
            {{ addon.name
            }}{{ addon.maxQuantity !== undefined ? ` × ${sel.quantity}` : "" }}
          </span>
          <span class="text-xs text-neutral-muted shrink-0">
            {{ formatCurrency(addon.price * sel.quantity) }}
          </span>
        </div>

        <!-- VIP workshop discount -->
        <div
          v-if="timedAddonDiscount > 0"
          class="flex justify-between items-center gap-4"
        >
          <span class="text-[11px] leading-[14px] text-brand"
            >Workshop discount (VIP 10%)</span
          >
          <span class="text-[11px] leading-[14px] text-brand shrink-0">
            -{{ formatCurrency(timedAddonDiscount) }}
          </span>
        </div>

        <!-- Divider -->
        <div class="h-px bg-black/5" />

        <!-- Total -->
        <div class="flex justify-between items-center gap-4">
          <span class="text-xs font-medium text-neutral">Total</span>
          <span class="text-xs font-medium text-neutral shrink-0">{{
            formatCurrency(orderTotal)
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
