<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { fetchSessions } from "src/api/sessions";
import { ADDON_CATEGORY_LABELS } from "src/api/addons";
import type { Session } from "src/api/sessions";
import { useRegistration, useValidation } from "src/stores/registration";
import { useOrderSummary } from "src/composables/useOrderSummary";
import { formatCurrency, formatTime } from "src/lib/utils";

defineEmits<{
  "edit-step": [step: string];
}>();

const registration = useRegistration();
const { validationErrors, timeConflicts, stepErrors, fieldError } =
  useValidation();
const { loading, currentTicket, selectedAddonDetails, timedAddonDiscount, orderTotal } = useOrderSummary();

const sessions = ref<Session[]>([]);

onMounted(async () => {
  sessions.value = await fetchSessions();
});

const selectedSessions = computed(() =>
  sessions.value.filter((s) => registration.selectedSessionIds.includes(s.id)),
);

// ── Error helpers ────────────────────────────────────────────────

function fieldHasError(...path: string[]): boolean {
  return !!fieldError(...path);
}

function displayValue(value: string | undefined, hasError: boolean, requiredLabel = "— (required)"): string {
  return value || (hasError ? requiredLabel : "—");
}

function sectionBorderClass(hasError: boolean): string {
  return hasError
    ? "border-2 border-solid border-danger-emphasis"
    : "border border-solid border-neutral-muted";
}

function sectionTitleClass(hasError: boolean): string {
  return hasError ? "text-danger-emphasis" : "text-neutral";
}

const attendeeFields = computed(() => {
  const info = registration.attendeeInfo;
  const fields = [
    { label: "Name", error: fieldHasError("attendeeInfo", "fullName"), value: displayValue(info.fullName, fieldHasError("attendeeInfo", "fullName")) },
    { label: "Email", error: fieldHasError("attendeeInfo", "email"), value: displayValue(info.email, fieldHasError("attendeeInfo", "email")) },
    { label: "Phone", error: fieldHasError("attendeeInfo", "phone"), value: displayValue(info.phone, fieldHasError("attendeeInfo", "phone")) },
    { label: "Company", error: fieldHasError("attendeeInfo", "company"), value: displayValue(info.company, fieldHasError("attendeeInfo", "company")) },
    { label: "Job Title", error: fieldHasError("attendeeInfo", "jobTitle"), value: displayValue(info.jobTitle, fieldHasError("attendeeInfo", "jobTitle")) },
    {
      label: "Ticket Type",
      error: fieldHasError("attendeeInfo", "ticketId"),
      value: currentTicket.value
        ? `${currentTicket.value.name} (${formatCurrency(currentTicket.value.price)})`
        : displayValue(undefined, fieldHasError("attendeeInfo", "ticketId")),
    },
  ];

  if (info.shippingAddress || fieldHasError("attendeeInfo", "shippingAddress")) {
    fields.push({
      label: "Shipping Address",
      error: fieldHasError("attendeeInfo", "shippingAddress"),
      value: displayValue(info.shippingAddress, true, "— (required for merchandise)"),
    });
  }

  return fields;
});

const step2ErrorMessages = computed(() => [
  ...validationErrors.value
    .filter((e) => String(e.path?.[0]) === "selectedSessionIds")
    .map((e) => e.message),
  ...timeConflicts.value,
]);

const step3ErrorMessages = computed(() =>
  validationErrors.value
    .filter((e) => String(e.path?.[0]) === "selectedAddons")
    .map((e) => e.message),
);

function formatBannerError(issue: { message: string; path: (string | number)[] }): string {
  const root = String(issue.path?.[0]);
  if (root === "attendeeInfo") return `Step 1: ${issue.message}`;
  if (root === "selectedSessionIds") return `Step 2: ${issue.message}`;
  if (root === "selectedAddons") return `Step 3: ${issue.message}`;
  return issue.message;
}

const bannerErrors = computed(() => [
  ...validationErrors.value.map(formatBannerError),
  ...timeConflicts.value.map((msg: string) => `Step 2: ${msg}`),
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
      class="flex flex-col gap-2 p-4 rounded-md bg-danger-subtle-rest border border-danger-muted"
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
        class="h-40 rounded-md bg-surface-l2 animate-pulse"
      />
    </template>

    <template v-else>
      <!-- ── Attendee Information ── -->
      <section
        class="flex flex-col gap-3 p-5 rounded-md bg-surface-l2"
        :class="sectionBorderClass(stepErrors.step1)"
      >
        <div class="flex justify-between items-center">
          <h3 class="text-subtitle1 m-0" :class="sectionTitleClass(stepErrors.step1)">
            Attendee Information
          </h3>
          <button
            class="text-xs font-semibold text-brand-muted underline bg-transparent border-none cursor-pointer"
            @click="$emit('edit-step', 'step1')"
          >
            Edit → Step 1
          </button>
        </div>

        <div
          v-for="field in attendeeFields"
          :key="field.label"
          class="flex justify-between"
        >
          <span class="text-xs text-neutral-muted leading-4">{{ field.label }}</span>
          <span
            class="text-xs leading-4"
            :class="field.error ? 'text-danger-emphasis' : 'text-neutral'"
          >
            {{ field.value }}
          </span>
        </div>
      </section>

      <!-- ── Selected Sessions ── -->
      <section
        class="flex flex-col gap-3 p-5 rounded-md bg-surface-l2"
        :class="sectionBorderClass(stepErrors.step2)"
      >
        <div class="flex justify-between items-center">
          <h3 class="text-subtitle1 m-0" :class="sectionTitleClass(stepErrors.step2)">
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

        <div v-if="step2ErrorMessages.length" class="flex flex-col gap-1">
          <p
            v-for="(msg, i) in step2ErrorMessages"
            :key="i"
            class="text-xs text-danger-emphasis m-0"
          >
            &bull; {{ msg }}
          </p>
        </div>
      </section>

      <!-- ── Add-ons ── -->
      <section
        class="flex flex-col gap-3 p-5 rounded-md bg-surface-l2"
        :class="sectionBorderClass(stepErrors.step3)"
      >
        <div class="flex justify-between items-center">
          <h3 class="text-subtitle1 m-0" :class="sectionTitleClass(stepErrors.step3)">
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

        <div v-if="step3ErrorMessages.length" class="flex flex-col gap-1">
          <p
            v-for="(msg, i) in step3ErrorMessages"
            :key="i"
            class="text-xs text-danger-emphasis m-0"
          >
            &bull; {{ msg }}
          </p>
        </div>
      </section>

      <!-- ── Pricing Summary ── -->
      <section
        class="flex flex-col gap-2 p-5 rounded-md border border-solid border-neutral-muted bg-surface-l2"
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
            }}{{ addon.maxQuantity !== undefined ? ` × ${sel.quantity}` : "" }}
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
