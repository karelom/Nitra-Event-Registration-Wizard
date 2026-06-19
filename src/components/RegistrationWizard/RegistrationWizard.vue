<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { QStepper } from "quasar";
import { fetchEvent } from "src/api/event";
import { fetchSessions } from "src/api/sessions";
import { useValidation } from "src/stores/registration";
import Step1AttendeeInfo from "src/components/RegistrationWizard/steps/Step1AttendeeInfo.vue";
import Step2SessionSelection from "src/components/RegistrationWizard/steps/Step2SessionSelection.vue";
import Step3Addons from "src/components/RegistrationWizard/steps/Step3Addons.vue";
import Step4Review from "src/components/RegistrationWizard/steps/Step4Review.vue";
import SuccessState from "src/components/shared/SuccessState.vue";

const STEP = {
  ATTENDEE_INFO: "step1",
  SESSION_SELECTION: "step2",
  ADDONS: "step3",
  REVIEW: "step4",
} as const;

type StepName = (typeof STEP)[keyof typeof STEP];

const STEP_ORDER: StepName[] = [
  STEP.ATTENDEE_INFO,
  STEP.SESSION_SELECTION,
  STEP.ADDONS,
  STEP.REVIEW,
];

const { stepErrors, hasValidationErrors, attemptSubmit, setCachedSessions } =
  useValidation();

const stepperRef = ref<QStepper | null>(null);
const currentStep = ref<StepName>(STEP.ATTENDEE_INFO);
const submitted = ref(false);
const eventName = ref("");

onMounted(async () => {
  const [ev, sess] = await Promise.all([fetchEvent(), fetchSessions()]);
  eventName.value = ev.name;
  setCachedSessions(sess);
});

const stepIndex = computed(() => STEP_ORDER.indexOf(currentStep.value));
const isFirst = computed(() => stepIndex.value === 0);

const nextLabel = computed<string>(
  () =>
    ({
      [STEP.ATTENDEE_INFO]: "Next: Session Selection",
      [STEP.SESSION_SELECTION]: "Next: Add-ons",
      [STEP.ADDONS]: "Next: Review",
      [STEP.REVIEW]: "Submit Registration",
    })[currentStep.value],
);

function isDone(step: StepName): boolean {
  return stepIndex.value > STEP_ORDER.indexOf(step);
}

function goNext() {
  stepperRef.value?.next();
}

function goBack() {
  stepperRef.value?.previous();
}

function goToStep(name: StepName) {
  currentStep.value = name;
}

function onSubmit() {
  if (attemptSubmit()) {
    submitted.value = true;
  }
}

defineExpose({ goToStep });
</script>

<template>
  <SuccessState v-if="submitted" />

  <div v-else class="flex flex-col h-screen overflow-hidden">
    <!-- ── Header ── -->
    <header class="flex items-center gap-3 px-12 py-4 bg-surface-l0">
      <div
        class="w-10 h-10 rounded-lg bg-brand-emphasis-rest flex items-center justify-center shrink-0"
      >
        <span class="text-inverse text-sm font-bold leading-none">N</span>
      </div>
      <span class="text-h4 text-neutral">{{ eventName }}&nbsp;</span>
    </header>
    <div class="h-px bg-black/10" />

    <!-- ── Stepper ── -->
    <q-stepper
      ref="stepperRef"
      v-model="currentStep"
      animated
      flat
      class="flex-1 flex flex-col overflow-hidden min-h-0"
    >
      <q-step
        :name="STEP.ATTENDEE_INFO"
        title="Attendee Info"
        prefix="1"
        error-icon="error"
        :done="isDone(STEP.ATTENDEE_INFO)"
        :error="stepErrors.step1"
      >
        <Step1AttendeeInfo />
      </q-step>

      <q-step
        :name="STEP.SESSION_SELECTION"
        title="Sessions"
        prefix="2"
        error-icon="error"
        :done="isDone(STEP.SESSION_SELECTION)"
        :error="stepErrors.step2"
      >
        <Step2SessionSelection />
      </q-step>

      <q-step
        :name="STEP.ADDONS"
        title="Add-ons"
        prefix="3"
        error-icon="error"
        :done="isDone(STEP.ADDONS)"
        :error="stepErrors.step3"
      >
        <Step3Addons />
      </q-step>

      <q-step
        :name="STEP.REVIEW"
        title="Review"
        prefix="4"
        :done="isDone(STEP.REVIEW)"
      >
        <Step4Review @edit-step="goToStep($event as StepName)" />
      </q-step>

      <!-- ── Shared footer ── -->
      <template #navigation>
        <div class="h-px bg-black/10" />
        <div class="flex items-center px-[120px] py-4 bg-surface-l0">
          <q-btn
            v-if="!isFirst"
            flat
            label="Back"
            padding="10px 16px"
            class="text-neutral-muted"
            @click="goBack"
          />

          <q-btn
            :label="nextLabel"
            unelevated
            :padding="currentStep === STEP.REVIEW ? '12px' : '10px 16px'"
            class="ml-auto bg-accent-emphasis-rest text-inverse text-sm font-semibold"
            :class="[
              currentStep === STEP.REVIEW ? 'rounded-xl' : 'rounded-[10px]',
              currentStep === STEP.REVIEW && hasValidationErrors
                ? 'opacity-50'
                : '',
            ]"
            @click="currentStep === STEP.REVIEW ? onSubmit() : goNext()"
          />
        </div>
      </template>
    </q-stepper>
  </div>
</template>

<style scoped>
:deep(.q-stepper__content) {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
</style>
