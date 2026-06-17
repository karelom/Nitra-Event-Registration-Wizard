<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { QStepper } from 'quasar'
import { fetchEvent } from 'src/api/event'
import Step1AttendeeInfo from 'src/components/steps/Step1AttendeeInfo.vue'
import Step2SessionSelection from 'src/components/steps/Step2SessionSelection.vue'
import Step3Addons from 'src/components/steps/Step3Addons.vue'
import Step4Review from 'src/components/steps/Step4Review.vue'
import SuccessState from 'src/components/SuccessState.vue'

const STEP = {
  ATTENDEE_INFO: 'step1',
  SESSION_SELECTION: 'step2',
  ADDONS: 'step3',
  REVIEW: 'step4',
} as const

type StepName = typeof STEP[keyof typeof STEP]

const STEP_ORDER: StepName[] = [STEP.ATTENDEE_INFO, STEP.SESSION_SELECTION, STEP.ADDONS, STEP.REVIEW]

const stepperRef = ref<QStepper | null>(null)
const currentStep = ref<StepName>(STEP.ATTENDEE_INFO)
const submitted = ref(false)
const eventName = ref('')

onMounted(async () => {
  const ev = await fetchEvent()
  eventName.value = ev.name
})

const stepIndex = computed(() => STEP_ORDER.indexOf(currentStep.value))
const isFirst = computed(() => stepIndex.value === 0)

/** Primary action button label, specific to each step. */
const nextLabel = computed<string>(() => ({
  [STEP.ATTENDEE_INFO]: 'Next: Session Selection',
  [STEP.SESSION_SELECTION]: 'Next: Add-ons',
  [STEP.ADDONS]: 'Next: Review',
  [STEP.REVIEW]: 'Submit Registration',
})[currentStep.value])

function isDone(step: StepName): boolean {
  return stepIndex.value > STEP_ORDER.indexOf(step)
}

function goNext() {
  stepperRef.value?.next()
}

function goBack() {
  stepperRef.value?.previous()
}

function goToStep(name: StepName) {
  currentStep.value = name
}

function onSubmit() {
  submitted.value = true
}

defineExpose({ goToStep })
</script>

<template>
  <SuccessState v-if="submitted" />

  <div v-else class="flex flex-col min-h-screen">

    <!-- ── Header ── -->
    <header class="flex items-center gap-3 px-12 py-4 bg-surface-l0">
      <!-- Logo -->
      <div class="w-10 h-10 rounded-[8px] bg-brand-emphasis-rest flex items-center justify-center shrink-0">
        <span class="text-inverse text-sm font-bold leading-none">N</span>
      </div>
      <!-- Event name — non-breaking space keeps height stable while loading -->
      <span class="text-h4 text-neutral">{{ eventName }}&nbsp;</span>
    </header>
    <div class="h-px bg-black/10" />

    <!-- ── Stepper (progress indicator + step content) ── -->
    <q-stepper
      ref="stepperRef"
      v-model="currentStep"
      animated
      flat
      class="flex-1"
    >
      <q-step
        :name="STEP.ATTENDEE_INFO"
        title="Attendee Info"
        icon="person"
        :done="isDone(STEP.ATTENDEE_INFO)"
      >
        <Step1AttendeeInfo />
      </q-step>

      <q-step
        :name="STEP.SESSION_SELECTION"
        title="Sessions"
        icon="event"
        :done="isDone(STEP.SESSION_SELECTION)"
      >
        <Step2SessionSelection />
      </q-step>

      <q-step
        :name="STEP.ADDONS"
        title="Add-ons"
        icon="card_giftcard"
        :done="isDone(STEP.ADDONS)"
      >
        <Step3Addons />
      </q-step>

      <q-step
        :name="STEP.REVIEW"
        title="Review"
        icon="check_circle"
        :done="isDone(STEP.REVIEW)"
      >
        <Step4Review />
      </q-step>

      <!-- ── Shared footer: Back + primary action ── -->
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
            padding="10px 16px"
            class="ml-auto bg-accent-emphasis-rest text-inverse rounded-[10px] text-sm font-semibold"
            @click="currentStep === STEP.REVIEW ? onSubmit() : goNext()"
          />
        </div>
      </template>
    </q-stepper>

  </div>
</template>
