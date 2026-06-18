<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { fetchEvent } from "src/api/event";
import { fetchSessions } from "src/api/sessions";
import { fetchAddons, ADDON_CATEGORY_LABELS } from "src/api/addons";
import type { TicketType } from "src/api/event";
import type { Session } from "src/api/sessions";
import type { Addon } from "src/api/addons";
import { useRegistration } from "src/stores/registration";
import { formatCurrency, formatTime } from "src/lib/utils";

interface ValidationIssue {
  message: string;
  path: (string | number)[];
}

interface Step4ReviewProps {
  errors: ValidationIssue[];
  timeConflicts: string[];
}

const props = defineProps<Step4ReviewProps>();

defineEmits<{
  "edit-step": [step: string];
}>();

const registration = useRegistration();
const ticketTypes = ref<TicketType[]>([]);
const sessions = ref<Session[]>([]);
const addons = ref<Addon[]>([]);
const loading = ref(true);

onMounted(async () => {
  const [ev, sess, adds] = await Promise.all([
    fetchEvent(),
    fetchSessions(),
    fetchAddons(),
  ]);
  ticketTypes.value = ev.ticketTypes;
  sessions.value = sess;
  addons.value = adds;
  loading.value = false;
});

const currentTicket = computed(() =>
  ticketTypes.value.find((t) => t.id === registration.ticketId),
);

const selectedSessions = computed(() =>
  sessions.value.filter((s) =>
    registration.selectedSessionIds.includes(s.id),
  ),
);

const selectedAddonDetails = computed(() =>
  registration.selectedAddons
    .map((sel) => ({ sel, addon: addons.value.find((a) => a.id === sel.id) }))
    .filter(
      (item): item is {
        sel: (typeof registration.selectedAddons)[number];
        addon: Addon;
      } => !!item.addon,
    ),
);

const isVip = computed(() => registration.ticketId === "vip");

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

// ── Error helpers ────────────────────────────────────────────────

const STEP1_FIELDS = new Set([
  "ticketId",
  "fullName",
  "email",
  "phone",
  "company",
  "jobTitle",
  "shippingAddress",
]);

const step1Errors = computed(() =>
  props.errors.filter((e) => STEP1_FIELDS.has(String(e.path?.[0]))),
);

const step2Errors = computed(() => [
  ...props.errors.filter(
    (e) => String(e.path?.[0]) === "selectedSessionIds",
  ),
  ...props.timeConflicts.map((msg) => ({
    message: msg,
    path: ["selectedSessionIds"] as (string | number)[],
  })),
]);

const step3Errors = computed(() =>
  props.errors.filter((e) => String(e.path?.[0]) === "selectedAddons"),
);

function fieldHasError(fieldName: string): boolean {
  return props.errors.some((e) => String(e.path?.[0]) === fieldName);
}

function formatBannerError(issue: ValidationIssue): string {
  const field = String(issue.path?.[0]);
  if (STEP1_FIELDS.has(field)) return `Step 1: ${issue.message}`;
  if (field === "selectedSessionIds") return `Step 2: ${issue.message}`;
  if (field === "selectedAddons") return `Step 3: ${issue.message}`;
  return issue.message;
}

const bannerErrors = computed(() => [
  ...props.errors.map(formatBannerError),
  ...props.timeConflicts.map((msg) => `Step 2: ${msg}`),
]);

function formatSessionDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
</script>

<template>
  <div class="flex flex-col gap-6 py-10 px-[120px]">
    <!-- ── Error banner ── -->
    <div
      v-if="bannerErrors.length"
      class="flex flex-col gap-2 p-4 rounded-[6px] bg-danger-subtle-rest border border-danger-muted"
    >
      <span class="text-xs font-medium text-danger-emphasis leading-4">
        Please fix the following errors before submitting
      </span>
      <span
        v-for="(err, i) in bannerErrors"
        :key="i"
        class="text-xs text-danger-emphasis leading-4"
      >
        &bull; {{ err }}
      </span>
    </div>

    <h2 class="text-h3 text-neutral m-0">Review Your Registration</h2>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div
        v-for="n in 4"
        :key="n"
        class="h-40 rounded-[6px] bg-surface-l2 animate-pulse"
      />
    </template>

    <template v-else>
      <!-- ── Attendee Information ── -->
      <section
        class="flex flex-col gap-3 p-5 rounded-[6px] bg-surface-l2"
        :class="
          step1Errors.length
            ? 'border-2 border-danger-emphasis'
            : 'border border-neutral-muted'
        "
      >
        <div class="flex justify-between items-center">
          <h3
            class="text-subtitle1 m-0"
            :class="
              step1Errors.length ? 'text-danger-emphasis' : 'text-neutral'
            "
          >
            Attendee Information
          </h3>
          <button
            class="text-xs font-semibold text-brand-muted underline bg-transparent border-none cursor-pointer"
            @click="$emit('edit-step', 'step1')"
          >
            Edit → Step 1
          </button>
        </div>

        <div class="flex justify-between">
          <span class="text-xs text-neutral-muted leading-4">Name</span>
          <span
            class="text-xs leading-4"
            :class="
              !registration.fullName && fieldHasError('fullName')
                ? 'text-danger-emphasis'
                : 'text-neutral'
            "
          >
            {{
              registration.fullName ||
              (fieldHasError("fullName") ? "— (required)" : "—")
            }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-xs text-neutral-muted leading-4">Email</span>
          <span
            class="text-xs leading-4"
            :class="
              !registration.email && fieldHasError('email')
                ? 'text-danger-emphasis'
                : 'text-neutral'
            "
          >
            {{
              registration.email ||
              (fieldHasError("email") ? "— (required)" : "—")
            }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-xs text-neutral-muted leading-4">Phone</span>
          <span
            class="text-xs leading-4"
            :class="
              !registration.phone && fieldHasError('phone')
                ? 'text-danger-emphasis'
                : 'text-neutral'
            "
          >
            {{
              registration.phone ||
              (fieldHasError("phone") ? "— (required)" : "—")
            }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-xs text-neutral-muted leading-4">Company</span>
          <span
            class="text-xs leading-4"
            :class="
              !registration.company && fieldHasError('company')
                ? 'text-danger-emphasis'
                : 'text-neutral'
            "
          >
            {{
              registration.company ||
              (fieldHasError("company") ? "— (required)" : "—")
            }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-xs text-neutral-muted leading-4">Job Title</span>
          <span
            class="text-xs leading-4"
            :class="
              !registration.jobTitle && fieldHasError('jobTitle')
                ? 'text-danger-emphasis'
                : 'text-neutral'
            "
          >
            {{
              registration.jobTitle ||
              (fieldHasError("jobTitle") ? "— (required)" : "—")
            }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-xs text-neutral-muted leading-4"
            >Ticket Type</span
          >
          <span class="text-xs text-neutral leading-4">
            {{
              currentTicket
                ? `${currentTicket.name} (${formatCurrency(currentTicket.price)})`
                : "—"
            }}
          </span>
        </div>
        <div
          v-if="
            registration.shippingAddress ||
            fieldHasError('shippingAddress')
          "
          class="flex justify-between"
        >
          <span class="text-xs text-neutral-muted leading-4"
            >Shipping Address</span
          >
          <span
            class="text-xs leading-4"
            :class="
              !registration.shippingAddress &&
              fieldHasError('shippingAddress')
                ? 'text-danger-emphasis'
                : 'text-neutral'
            "
          >
            {{
              registration.shippingAddress ||
              "— (required for merchandise)"
            }}
          </span>
        </div>
      </section>

      <!-- ── Selected Sessions ── -->
      <section
        class="flex flex-col gap-3 p-5 rounded-[6px] bg-surface-l2"
        :class="
          step2Errors.length
            ? 'border-2 border-danger-emphasis'
            : 'border border-neutral-muted'
        "
      >
        <div class="flex justify-between items-center">
          <h3
            class="text-subtitle1 m-0"
            :class="
              step2Errors.length ? 'text-danger-emphasis' : 'text-neutral'
            "
          >
            Selected Sessions
          </h3>
          <button
            class="text-xs font-semibold text-brand-muted underline bg-transparent border-none cursor-pointer"
            @click="$emit('edit-step', 'step2')"
          >
            Edit → Step 2
          </button>
        </div>

        <template v-if="selectedSessions.length">
          <div
            v-for="session in selectedSessions"
            :key="session.id"
            class="flex justify-between"
          >
            <span class="text-xs text-neutral-muted leading-4">
              {{ formatSessionDate(session.date) }},
              {{ formatTime(session.date) }}
            </span>
            <span class="text-xs text-neutral leading-4">{{
              session.title
            }}</span>
          </div>
        </template>
        <p v-else class="text-xs text-neutral-quiet m-0 italic">
          No sessions selected
        </p>

        <div v-if="step2Errors.length" class="flex flex-col gap-1">
          <p
            v-for="(err, i) in step2Errors"
            :key="i"
            class="text-xs text-danger-emphasis m-0"
          >
            &bull; {{ err.message }}
          </p>
        </div>
      </section>

      <!-- ── Add-ons ── -->
      <section
        class="flex flex-col gap-3 p-5 rounded-[6px] bg-surface-l2"
        :class="
          step3Errors.length
            ? 'border-2 border-danger-emphasis'
            : 'border border-neutral-muted'
        "
      >
        <div class="flex justify-between items-center">
          <h3
            class="text-subtitle1 m-0"
            :class="
              step3Errors.length ? 'text-danger-emphasis' : 'text-neutral'
            "
          >
            Add-ons
          </h3>
          <button
            class="text-xs font-semibold text-brand-muted underline bg-transparent border-none cursor-pointer"
            @click="$emit('edit-step', 'step3')"
          >
            Edit → Step 3
          </button>
        </div>

        <template v-if="selectedAddonDetails.length">
          <div
            v-for="{ addon, sel } in selectedAddonDetails"
            :key="addon.id"
            class="flex justify-between"
          >
            <span class="text-xs text-neutral-muted leading-4">{{
              ADDON_CATEGORY_LABELS[addon.category]
            }}</span>
            <span class="text-xs text-neutral leading-4">
              {{ addon.name
              }}{{
                addon.maxQuantity !== undefined ? ` × ${sel.quantity}` : ""
              }}
              ({{ formatCurrency(addon.price) }})
            </span>
          </div>
        </template>
        <p v-else class="text-xs text-neutral-quiet m-0 italic">
          No add-ons selected
        </p>

        <div v-if="step3Errors.length" class="flex flex-col gap-1">
          <p
            v-for="(err, i) in step3Errors"
            :key="i"
            class="text-xs text-danger-emphasis m-0"
          >
            &bull; {{ err.message }}
          </p>
        </div>
      </section>

      <!-- ── Pricing Summary ── -->
      <section
        class="flex flex-col gap-2 p-5 rounded-[6px] border border-neutral-muted bg-surface-l2"
      >
        <h3 class="text-subtitle1 text-neutral m-0">Pricing Summary</h3>

        <div v-if="currentTicket" class="flex justify-between">
          <span class="text-xs text-neutral-muted leading-4"
            >{{ currentTicket.name }} Ticket</span
          >
          <span class="text-xs text-neutral-muted leading-4">{{
            formatCurrency(currentTicket.price)
          }}</span>
        </div>

        <div
          v-for="{ addon, sel } in selectedAddonDetails"
          :key="addon.id"
          class="flex justify-between"
        >
          <span class="text-xs text-neutral-muted leading-4">
            {{ addon.name
            }}{{
              addon.maxQuantity !== undefined ? ` × ${sel.quantity}` : ""
            }}
          </span>
          <span class="text-xs text-neutral-muted leading-4">{{
            formatCurrency(addon.price * sel.quantity)
          }}</span>
        </div>

        <div v-if="timedAddonDiscount > 0" class="flex justify-between">
          <span class="text-[11px] leading-[14px] text-brand"
            >Workshop discount (VIP 10%)</span
          >
          <span class="text-[11px] leading-[14px] text-brand"
            >-{{ formatCurrency(timedAddonDiscount) }}</span
          >
        </div>

        <div class="h-px bg-black/5" />

        <div class="flex justify-between">
          <span class="text-xs font-medium text-neutral leading-4"
            >Grand Total</span
          >
          <span class="text-xs font-medium text-neutral leading-4">{{
            formatCurrency(orderTotal)
          }}</span>
        </div>
      </section>
    </template>
  </div>
</template>
