<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchEvent } from 'src/api/event'
import type { TicketType } from 'src/api/event'
import { useRegistration } from 'src/stores/registration'
import AppInput from 'src/components/shared/AppInput.vue'

interface Step1AttendeeInfoProps {
  shippingError?: string
}

const props = defineProps<Step1AttendeeInfoProps>()

const registration = useRegistration()
const ticketTypes = ref<TicketType[]>([])
const loading = ref(true)

onMounted(async () => {
  const ev = await fetchEvent()
  ticketTypes.value = ev.ticketTypes
  loading.value = false
})

/** The currently selected ticket, or null if none chosen yet. */
const selectedTicket = computed(() =>
  ticketTypes.value.find((t) => t.id === registration.ticketId) ?? null
)

const hasMerchandise = computed(() =>
  registration.selectedAddons.some((a) => a.category === "merchandise"),
)

const shippingLabel = computed(() =>
  hasMerchandise.value ? "Shipping Address *" : "Shipping Address (Optional)",
)
</script>

<template>
  <!-- Content: ticket selection + attendee form -->
  <div class="flex flex-col gap-8 py-10 px-[120px]">

    <!-- Ticket Type -->
    <section class="flex flex-col gap-4">
      <h2 class="text-subtitle1 text-neutral m-0">Select Ticket Type</h2>

      <!-- Loading skeleton -->
      <div v-if="loading" class="flex gap-4">
        <div
          v-for="n in 3"
          :key="n"
          class="flex-1 h-48 rounded-[6px] bg-surface-l2 animate-pulse"
        />
      </div>

      <!-- Ticket cards -->
      <div v-else class="flex gap-4">
        <div
          v-for="ticket in ticketTypes"
          :key="ticket.id"
          class="flex-1 flex flex-col gap-3 p-5 rounded-[6px] border-2 cursor-pointer transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04),0px_4px_16px_0px_rgba(0,0,0,0.08)]"
          :class="selectedTicket?.id === ticket.id
            ? 'bg-brand-subtle-rest border-brand-emphasis'
            : 'bg-surface-l1 border-neutral-muted'"
          @click="registration.ticketId = ticket.id"
        >
          <!-- Name + Price -->
          <div class="flex justify-between items-center">
            <span class="text-subtitle1 text-neutral">{{ ticket.name }}</span>
            <span class="text-subtitle1 text-neutral">${{ ticket.price }}</span>
          </div>

          <!-- Description -->
          <p class="text-xs text-neutral-muted leading-4 m-0">{{ ticket.description }}</p>

          <!-- Perks -->
          <div
            v-for="perk in ticket.perks"
            :key="perk"
            class="flex items-center gap-2"
          >
            <q-icon name="check_circle" size="14px" class="text-neutral-muted shrink-0" />
            <span class="text-xs text-neutral-muted leading-4">{{ perk }}</span>
          </div>

          <!-- Selected badge -->
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
        <!-- Row 1: Full Name + Email -->
        <div class="flex gap-6">
          <AppInput
            v-model="registration.fullName"
            label="Full Name"
            placeholder="John full name"
          />
          <AppInput
            v-model="registration.email"
            label="Email"
            placeholder="John email address"
            type="email"
          />
        </div>

        <!-- Row 2: Phone + Company -->
        <div class="flex gap-6">
          <AppInput
            v-model="registration.phone"
            label="Phone"
            placeholder="Enter your phone number"
            type="tel"
          />
          <AppInput
            v-model="registration.company"
            label="Company"
            placeholder="Enter your company name"
          />
        </div>

        <!-- Row 3: Job Title (full width) -->
        <div class="flex gap-6">
          <AppInput
            v-model="registration.jobTitle"
            label="Job Title"
            placeholder="Enter your job title"
          />
        </div>

        <!-- Row 4: Shipping Address (full width, optional) -->
        <div class="flex gap-6">
          <AppInput
            v-model="registration.shippingAddress"
            :label="shippingLabel"
            placeholder="Enter your shipping address"
            :error="props.shippingError"
          />
        </div>
      </div>
    </section>
  </div>

</template>
