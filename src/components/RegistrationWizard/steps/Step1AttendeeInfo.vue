<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchEvent } from 'src/api/event'
import type { TicketType } from 'src/api/event'
import { useRegistration, useValidation } from 'src/stores/registration'
import AppInput from 'src/components/shared/AppInput.vue'

const registration = useRegistration()
const { fieldError } = useValidation()

const ticketTypes = ref<TicketType[]>([])
const loading = ref(true)

onMounted(async () => {
  const ev = await fetchEvent()
  ticketTypes.value = ev.ticketTypes
  loading.value = false
})

const selectedTicket = computed(() =>
  ticketTypes.value.find((t) => t.id === registration.attendeeInfo.ticketId) ?? null
)

const hasMerchandise = computed(() =>
  registration.selectedAddons.some((a) => a.category === "merchandise"),
)

const shippingLabel = computed(() =>
  hasMerchandise.value ? "Shipping Address *" : "Shipping Address (Optional)",
)
</script>

<template>
  <div class="flex flex-col gap-8 py-10 px-[120px]">

    <!-- Ticket Type -->
    <section class="flex flex-col gap-4">
      <h2 class="text-subtitle1 text-neutral m-0">Select Ticket Type</h2>

      <div v-if="loading" class="flex gap-4">
        <div
          v-for="n in 3"
          :key="n"
          class="flex-1 h-48 rounded-md bg-surface-l2 animate-pulse"
        />
      </div>

      <div v-else class="flex gap-4">
        <div
          v-for="ticket in ticketTypes"
          :key="ticket.id"
          class="flex-1 flex flex-col gap-3 p-5 rounded-md border-2 cursor-pointer transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04),0px_4px_16px_0px_rgba(0,0,0,0.08)]"
          :class="selectedTicket?.id === ticket.id
            ? 'bg-brand-subtle-rest border-solid border-brand-emphasis'
            : fieldError('attendeeInfo', 'ticketId')
              ? 'bg-surface-l1 border-solid border-danger-emphasis'
              : 'bg-surface-l1 border-solid border-neutral-muted'"
          @click="registration.attendeeInfo.ticketId = ticket.id"
        >
          <div class="flex justify-between items-center">
            <span class="text-subtitle1 text-neutral">{{ ticket.name }}</span>
            <span class="text-subtitle1 text-neutral">${{ ticket.price }}</span>
          </div>

          <p class="text-xs text-neutral-muted leading-4 m-0">{{ ticket.description }}</p>

          <div
            v-for="perk in ticket.perks"
            :key="perk"
            class="flex items-center gap-2"
          >
            <q-icon name="check_circle" size="14px" class="text-neutral-muted shrink-0" />
            <span class="text-xs text-neutral-muted leading-4">{{ perk }}</span>
          </div>

          <div
            v-if="selectedTicket?.id === ticket.id"
            class="self-start mt-auto pt-1"
          >
            <span class="bg-success-bold-rest text-inverse text-[11px] font-medium leading-[14px] px-[9px] py-[3px] rounded-full">
              ✓ Selected
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Attendee Information -->
    <section class="flex flex-col gap-5">
      <h3 class="text-h3 text-neutral m-0">Attendee Information</h3>

      <div class="flex flex-col gap-5">
        <div class="flex gap-6">
          <AppInput
            v-model="registration.attendeeInfo.fullName"
            label="Full Name"
            placeholder="John full name"
            :error="fieldError('attendeeInfo', 'fullName')"
          />
          <AppInput
            v-model="registration.attendeeInfo.email"
            label="Email"
            placeholder="John email address"
            type="email"
            :error="fieldError('attendeeInfo', 'email')"
          />
        </div>

        <div class="flex gap-6">
          <AppInput
            v-model="registration.attendeeInfo.phone"
            label="Phone"
            placeholder="Enter your phone number"
            type="tel"
            :error="fieldError('attendeeInfo', 'phone')"
          />
          <AppInput
            v-model="registration.attendeeInfo.company"
            label="Company"
            placeholder="Enter your company name"
            :error="fieldError('attendeeInfo', 'company')"
          />
        </div>

        <div class="flex gap-6">
          <AppInput
            v-model="registration.attendeeInfo.jobTitle"
            label="Job Title"
            placeholder="Enter your job title"
            :error="fieldError('attendeeInfo', 'jobTitle')"
          />
        </div>

        <div class="flex gap-6">
          <AppInput
            v-model="registration.attendeeInfo.shippingAddress"
            :label="shippingLabel"
            placeholder="Enter your shipping address"
            :error="fieldError('attendeeInfo', 'shippingAddress')"
          />
        </div>
      </div>
    </section>
  </div>
</template>
