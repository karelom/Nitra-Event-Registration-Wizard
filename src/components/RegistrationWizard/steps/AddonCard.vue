<script setup lang="ts">
import { computed } from 'vue'
import type { Addon } from 'src/api/addons'
import { formatWorkshopTime } from 'src/lib/utils'

interface AddonCardProps {
  addon: Addon
  selected: boolean
  size: string
  quantity: number
  isConflict: boolean
}

const props = defineProps<AddonCardProps>()
const emit = defineEmits<{
  toggle: []
  'update:size': [size: string]
  'update:quantity': [qty: number]
}>()

const hasTimeSlot = computed(() => !!props.addon.date && !!props.addon.endDate)
const hasCapacity = computed(() => props.addon.capacity !== undefined && props.addon.registered !== undefined)
const hasControls = computed(() => props.addon.maxQuantity !== undefined)
const hasSizes = computed(() => !!props.addon.sizes?.length)

const isSoldOut = computed(() =>
  hasCapacity.value && props.addon.registered! >= props.addon.capacity!
)
const spotsLeft = computed(() => (props.addon.capacity ?? 0) - (props.addon.registered ?? 0))
const isDisabled = computed(() => isSoldOut.value || props.isConflict)
const canDecrement = computed(() => props.quantity > 0)
const canIncrement = computed(() =>
  props.addon.maxQuantity === undefined || props.quantity < props.addon.maxQuantity
)

const cardClass = computed(() => {
  const radius = hasControls.value ? 'rounded-lg' : 'rounded-[6px]'
  const borderWidth = hasControls.value ? 'border' : 'border-2'

  if (isDisabled.value) {
    return `${radius} ${borderWidth} bg-surface-l2 border-neutral-muted cursor-not-allowed`
  }
  if (props.selected) {
    return `${radius} ${borderWidth} bg-brand-subtle-rest border-brand-emphasis${hasControls.value ? '' : ' cursor-pointer'}`
  }
  return `${radius} ${borderWidth} bg-surface-l0 border-neutral-muted${hasControls.value ? '' : ' cursor-pointer hover:border-brand-muted'}`
})

function handleCardClick() {
  if (isDisabled.value || hasControls.value) return
  emit('toggle')
}

function decrement() {
  if (!canDecrement.value) return
  emit('update:quantity', props.quantity - 1)
}

function increment() {
  if (!canIncrement.value) return
  emit('update:quantity', props.quantity + 1)
}

function onSizeChange(event: Event) {
  emit('update:size', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div
    class="flex flex-col gap-2 p-4 transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04),0px_4px_16px_0px_rgba(0,0,0,0.08)]"
    :class="cardClass"
    @click="handleCardClick"
  >
    <!-- Header: name + price -->
    <div class="flex items-start justify-between gap-4">
      <p
        class="text-subtitle1 m-0 leading-5 flex-1"
        :class="isDisabled ? 'text-neutral-disabled' : 'text-neutral'"
      >
        {{ addon.name }}
      </p>
      <p
        class="text-subtitle1 m-0 leading-5 shrink-0"
        :class="hasTimeSlot ? 'text-brand' : 'text-neutral'"
      >
        ${{ addon.price }}
      </p>
    </div>

    <!-- Description -->
    <p
      class="text-xs m-0 leading-4"
      :class="isDisabled ? 'text-neutral-disabled' : 'text-neutral-muted'"
    >
      {{ addon.description }}
    </p>

    <!-- Time range (when addon has date + endDate) -->
    <p
      v-if="hasTimeSlot"
      class="text-[11px] leading-[14px] m-0"
      :class="isDisabled ? 'text-neutral-disabled' : 'text-neutral-quiet'"
    >
      {{ formatWorkshopTime(addon.date!, addon.endDate!) }}
    </p>

    <!-- Capacity status (when addon has capacity + registered) -->
    <p v-if="hasCapacity" class="text-[11px] leading-[14px] m-0 font-semibold">
      <span v-if="isSoldOut" class="text-neutral-quiet">Sold Out</span>
      <span v-else-if="isConflict" class="text-warning-emphasis">Time conflict with selected session</span>
      <span v-else class="text-neutral-quiet">{{ spotsLeft }} spot{{ spotsLeft === 1 ? '' : 's' }} remaining</span>
    </p>

    <!-- Controls (when addon has maxQuantity) -->
    <template v-if="hasControls">
      <div class="flex items-center gap-4 mt-1" @click.stop>
        <!-- Size dropdown (when addon has sizes) -->
        <div v-if="hasSizes" class="flex items-center gap-2">
          <span class="text-xs font-medium text-neutral-muted">Size:</span>
          <div class="relative">
            <select
              :value="size || ''"
              class="appearance-none pl-3 pr-7 py-1.5 rounded-[6px] bg-surface-l0 border border-neutral-muted text-xs cursor-pointer outline-none"
              :class="size ? 'text-neutral' : 'text-neutral-quiet'"
              @change="onSizeChange"
            >
              <option value="" disabled>Select</option>
              <option v-for="s in addon.sizes" :key="s" :value="s">{{ s }}</option>
            </select>
            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-quiet pointer-events-none">▾</span>
          </div>
        </div>

        <!-- Quantity picker -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-neutral-muted">Qty:</span>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-[6px] bg-surface-l2 border-none transition-opacity text-sm leading-none"
            :class="canDecrement ? 'cursor-pointer text-neutral' : 'opacity-40 cursor-not-allowed text-neutral-disabled'"
            @click="decrement"
          >
            –
          </button>
          <span class="w-6 text-center text-sm font-semibold text-neutral leading-[14px]">{{ quantity }}</span>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-[6px] bg-surface-l2 border-none transition-opacity text-sm leading-none"
            :class="canIncrement ? 'cursor-pointer text-neutral' : 'opacity-40 cursor-not-allowed text-neutral-disabled'"
            @click="increment"
          >
            +
          </button>
          <span v-if="addon.maxQuantity" class="text-[10px] text-neutral-quiet">max {{ addon.maxQuantity }}</span>
        </div>
      </div>

      <!-- Added indicator -->
      <span v-if="selected" class="text-[11px] font-semibold text-success-emphasis">
        ✓ Added to order
      </span>
    </template>
  </div>
</template>
