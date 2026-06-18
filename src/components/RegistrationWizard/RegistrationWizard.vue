<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { QStepper } from 'quasar'
import { fetchEvent } from 'src/api/event'
import { fetchSessions } from 'src/api/sessions'
import { useRegistration } from 'src/stores/registration'
import { registrationSchema } from 'src/schemas'
import Step1AttendeeInfo from 'src/components/RegistrationWizard/steps/Step1AttendeeInfo.vue'
import Step2SessionSelection from 'src/components/RegistrationWizard/steps/Step2SessionSelection.vue'
import Step3Addons from 'src/components/RegistrationWizard/steps/Step3Addons.vue'
import Step4Review from 'src/components/RegistrationWizard/steps/Step4Review.vue'
import SuccessState from 'src/components/shared/SuccessState.vue'

const STEP = {
  ATTENDEE_INFO: 'step1',
  SESSION_SELECTION: 'step2',
  ADDONS: 'step3',
  REVIEW: 'step4',
} as const

type StepName = typeof STEP[keyof typeof STEP]

const STEP_ORDER: StepName[] = [STEP.ATTENDEE_INFO, STEP.SESSION_SELECTION, STEP.ADDONS, STEP.REVIEW]

const registration = useRegistration()

const stepperRef = ref<QStepper | null>(null)
const currentStep = ref<StepName>(STEP.ATTENDEE_INFO)
const submitted = ref(false)
const eventName = ref('')

const validationErrors = ref<{ message: string; path: (string | number)[] }[]>([])
const timeConflicts = ref<string[]>([])

const STEP1_FIELDS = new Set(['ticketId', 'fullName', 'email', 'phone', 'company', 'jobTitle', 'shippingAddress'])

const stepErrors = computed(() => ({
  [STEP.ATTENDEE_INFO]: validationErrors.value.some((e) => STEP1_FIELDS.has(String(e.path?.[0]))),
  [STEP.SESSION_SELECTION]: validationErrors.value.some((e) => String(e.path?.[0]) === 'selectedSessionIds') || timeConflicts.value.length > 0,
  [STEP.ADDONS]: validationErrors.value.some((e) => String(e.path?.[0]) === 'selectedAddons'),
}))

const shippingAddressError = computed(() =>
  validationErrors.value.find((e) => String(e.path?.[0]) === 'shippingAddress')?.message ?? '',
)

const hasValidationErrors = computed(() =>
  validationErrors.value.length > 0 || timeConflicts.value.length > 0,
)

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

async function onSubmit() {
  const result = registrationSchema.safeParse({
    ticketId: registration.ticketId,
    fullName: registration.fullName,
    email: registration.email,
    phone: registration.phone,
    company: registration.company,
    jobTitle: registration.jobTitle,
    shippingAddress: registration.shippingAddress || undefined,
    selectedSessionIds: [...registration.selectedSessionIds],
    selectedAddons: registration.selectedAddons.map((a) => ({
      id: a.id,
      category: a.category,
      ...(a.size ? { size: a.size } : {}),
      quantity: a.quantity,
    })),
  })

  const allSessions = await fetchSessions()
  const selected = allSessions.filter((s) =>
    registration.selectedSessionIds.includes(s.id),
  )
  const conflicts: string[] = []
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = selected[i], b = selected[j]
      if (a.date < b.endDate && a.endDate > b.date) {
        conflicts.push(
          `"${a.title}" and "${b.title}" have overlapping time slots`,
        )
      }
    }
  }

  validationErrors.value = result.success
    ? []
    : result.error.issues.map((i) => ({
        message: i.message,
        path: i.path as (string | number)[],
      }))
  timeConflicts.value = conflicts

  if (result.success && conflicts.length === 0) {
    submitted.value = true
  }
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
        :error="stepErrors[STEP.ATTENDEE_INFO]"
      >
        <Step1AttendeeInfo :shipping-error="shippingAddressError" />
      </q-step>

      <q-step
        :name="STEP.SESSION_SELECTION"
        title="Sessions"
        icon="event"
        :done="isDone(STEP.SESSION_SELECTION)"
        :error="stepErrors[STEP.SESSION_SELECTION]"
      >
        <Step2SessionSelection />
      </q-step>

      <q-step
        :name="STEP.ADDONS"
        title="Add-ons"
        icon="card_giftcard"
        :done="isDone(STEP.ADDONS)"
        :error="stepErrors[STEP.ADDONS]"
      >
        <Step3Addons />
      </q-step>

      <q-step
        :name="STEP.REVIEW"
        title="Review"
        icon="check_circle"
        :done="isDone(STEP.REVIEW)"
      >
        <Step4Review
          :errors="validationErrors"
          :time-conflicts="timeConflicts"
          @edit-step="goToStep($event as StepName)"
        />
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
            :padding="currentStep === STEP.REVIEW ? '12px' : '10px 16px'"
            class="ml-auto bg-accent-emphasis-rest text-inverse text-sm font-semibold"
            :class="[
              currentStep === STEP.REVIEW ? 'rounded-[12px]' : 'rounded-[10px]',
              currentStep === STEP.REVIEW && hasValidationErrors ? 'opacity-50' : '',
            ]"
            @click="currentStep === STEP.REVIEW ? onSubmit() : goNext()"
          />
        </div>
      </template>
    </q-stepper>

  </div>
</template>
