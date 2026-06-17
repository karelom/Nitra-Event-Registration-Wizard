<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QStepper } from 'quasar'
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

const stepIndex = computed(() => STEP_ORDER.indexOf(currentStep.value))
const isFirst = computed(() => stepIndex.value === 0)
const isLast = computed(() => stepIndex.value === STEP_ORDER.length - 1)

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

  <q-stepper
    v-else
    ref="stepperRef"
    v-model="currentStep"
    animated
    flat
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
      title="Session Selection"
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
      title="Review & Submit"
      icon="check_circle"
      :done="isDone(STEP.REVIEW)"
    >
      <Step4Review @submit="onSubmit" />
    </q-step>

    <template #navigation>
      <q-stepper-navigation class="row justify-between q-pt-md">
        <q-btn
          v-if="!isFirst"
          flat
          label="Back"
          class="text-neutral"
          @click="goBack"
        />
        <div v-else />

        <q-btn
          v-if="!isLast"
          label="Next"
          class="bg-brand-emphasis-rest text-inverse"
          unelevated
          @click="goNext"
        />
        <q-btn
          v-else
          label="Submit"
          class="bg-brand-emphasis-rest text-inverse"
          unelevated
          @click="onSubmit"
        />
      </q-stepper-navigation>
    </template>
  </q-stepper>
</template>
