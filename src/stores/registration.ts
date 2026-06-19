import { reactive, computed, ref } from "vue";
import type { AddonSelection } from "src/schemas/Step3Addons";
import type { AttendeeInfo, TicketId } from "src/schemas/Step1AttendeeInfo";
import { TICKET_ID } from "src/schemas/Step1AttendeeInfo";
import type { Session } from "src/api/sessions";
import type { Addon } from "src/api/addons";
import { registrationSchema } from "src/schemas";
import { hasTimeOverlap } from "src/lib/utils";

interface RegistrationState {
  attendeeInfo: AttendeeInfo;
  selectedSessionIds: string[];
  selectedAddons: AddonSelection[];
}

const state = reactive<RegistrationState>({
  attendeeInfo: {
    ticketId: "" as TicketId,
    fullName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    shippingAddress: "",
  },
  selectedSessionIds: [],
  selectedAddons: [],
});

export const isVip = computed(
  () => state.attendeeInfo.ticketId === TICKET_ID.VIP,
);

/** Toggles a session and removes any workshop addons that now conflict. */
function toggleSession(id: string): void {
  const ids = state.selectedSessionIds;
  const idx = ids.indexOf(id);
  if (idx >= 0) {
    ids.splice(idx, 1);
    return;
  }

  ids.push(id);

  if (!_cachedSessions.value.length || !_cachedAddons.value.length) return;
  const selectedSess = _cachedSessions.value.filter((s) => ids.includes(s.id));
  for (let i = state.selectedAddons.length - 1; i >= 0; i--) {
    const addon = _cachedAddons.value.find((a) => a.id === state.selectedAddons[i].id);
    if (!addon?.date || !addon?.endDate) continue;
    if (selectedSess.some((s) => hasTimeOverlap(addon as { date: string; endDate: string }, s))) {
      state.selectedAddons.splice(i, 1);
    }
  }
}

/**
 * Returns the shared reactive registration state.
 * Used across all wizard steps for cross-step data access.
 */
export function useRegistration() {
  return state;
}

export { toggleSession };

// ── Validation ───────────────────────────────────────────────────

const _cachedSessions = ref<Session[]>([]);
const _cachedAddons = ref<Addon[]>([]);
const _hasAttemptedSubmit = ref(false);

const validationState = computed(() => {
  if (!_hasAttemptedSubmit.value) {
    return {
      issues: [] as { message: string; path: (string | number)[] }[],
      conflicts: [] as string[],
      conflictIds: new Set<string>(),
    };
  }

  const result = registrationSchema.safeParse({
    attendeeInfo: {
      ...state.attendeeInfo,
      shippingAddress: state.attendeeInfo.shippingAddress || undefined,
    },
    selectedSessionIds: [...state.selectedSessionIds],
    selectedAddons: state.selectedAddons.map((a) => ({
      id: a.id,
      category: a.category,
      ...(a.size ? { size: a.size } : {}),
      quantity: a.quantity,
    })),
  });

  const issues = result.success
    ? []
    : result.error.issues.map((i) => ({
        message: i.message,
        path: i.path as (string | number)[],
      }));

  const selected = _cachedSessions.value.filter((s) =>
    state.selectedSessionIds.includes(s.id),
  );
  const conflicts: string[] = [];
  const conflictIds = new Set<string>();
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = selected[i],
        b = selected[j];
      if (hasTimeOverlap(a, b)) {
        conflicts.push(
          `"${a.title}" and "${b.title}" have overlapping time slots`,
        );
        conflictIds.add(a.id);
        conflictIds.add(b.id);
      }
    }
  }

  for (const sel of state.selectedAddons) {
    const addon = _cachedAddons.value.find((a) => a.id === sel.id);
    if (addon?.sizes?.length && !sel.size) {
      issues.push({
        message: `Please select a size for ${addon.name}`,
        path: ["selectedAddons"],
      });
    }
  }

  return { issues, conflicts, conflictIds };
});

const validationErrors = computed(() => validationState.value.issues);
const timeConflicts = computed(() => validationState.value.conflicts);
const conflictingSessionIds = computed(() => validationState.value.conflictIds);

const stepErrors = computed(() => ({
  step1: validationErrors.value.some(
    (e) => String(e.path?.[0]) === "attendeeInfo",
  ),
  step2:
    validationErrors.value.some(
      (e) => String(e.path?.[0]) === "selectedSessionIds",
    ) || timeConflicts.value.length > 0,
  step3: validationErrors.value.some(
    (e) => String(e.path?.[0]) === "selectedAddons",
  ),
}));

const hasValidationErrors = computed(
  () => validationErrors.value.length > 0 || timeConflicts.value.length > 0,
);

/** Returns the first validation error message matching the given path segments, or undefined. */
function fieldError(...path: string[]): string | undefined {
  return validationErrors.value.find((e) =>
    path.every((p, i) => String(e.path?.[i]) === p),
  )?.message;
}

/** Caches the sessions catalog for time-conflict detection during validation. */
function setCachedSessions(sessions: Session[]) {
  _cachedSessions.value = sessions;
}

/** Caches the addons catalog for workshop conflict auto-removal on session toggle. */
function setCachedAddons(addons: Addon[]) {
  _cachedAddons.value = addons;
}

/** Activates validation and returns true if the form is valid. */
function attemptSubmit(): boolean {
  _hasAttemptedSubmit.value = true;
  return !hasValidationErrors.value;
}

/**
 * Returns reactive validation state.
 * Validation activates after the first `attemptSubmit()` call,
 * then re-evaluates automatically as the registration state changes.
 */
export function useValidation() {
  return {
    validationErrors,
    timeConflicts,
    conflictingSessionIds,
    stepErrors,
    hasValidationErrors,
    fieldError,
    attemptSubmit,
    setCachedSessions,
    setCachedAddons,
  };
}
