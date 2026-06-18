<script setup lang="ts">
import { computed } from 'vue'
import type { Session, SessionTrack } from 'src/api/sessions'
import { formatTimeRange } from 'src/lib/utils'

interface SessionCardProps {
  session: Session
  selected: boolean
  hasError?: boolean
}

const props = defineProps<SessionCardProps>()
const emit = defineEmits<{ toggle: [] }>()

const isSoldOut = computed(() => props.session.registered >= props.session.capacity)
const spotsLeft = computed(() => props.session.capacity - props.session.registered)
const fillPercent = computed(() => (props.session.registered / props.session.capacity) * 100)

const TRACK_BADGE: Record<SessionTrack, { bg: string; text: string; label: string }> = {
  main:     { bg: 'bg-neutral-subtle-rest', text: 'text-neutral-muted',    label: 'MAIN' },
  frontend: { bg: 'bg-warning-subtle-rest', text: 'text-warning-emphasis', label: 'FRONTEND' },
  backend:  { bg: 'bg-info-muted-rest',     text: 'text-info',             label: 'BACKEND' },
  devops:   { bg: 'bg-accent-muted-rest',   text: 'text-accent',           label: 'DEVOPS' },
}

function handleClick() {
  if (!isSoldOut.value) emit('toggle')
}
</script>

<template>
  <div
    class="flex flex-col gap-2 p-4 rounded-[6px] border-2 transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04),0px_4px_16px_0px_rgba(0,0,0,0.08)]"
    :class="isSoldOut
      ? 'bg-surface-l2 border-neutral-muted cursor-not-allowed'
      : selected && props.hasError
        ? 'bg-brand-subtle-rest border-solid border-danger-emphasis cursor-pointer'
        : selected
          ? 'bg-brand-subtle-rest border-brand-emphasis cursor-pointer'
          : props.hasError
            ? 'bg-surface-l0 border-solid border-danger-emphasis cursor-pointer'
            : 'bg-surface-l0 border-neutral-muted cursor-pointer hover:border-brand-muted'"
    @click="handleClick"
  >
    <!-- Top row: track badge + checkbox -->
    <div class="flex items-center justify-between">
      <span
        class="text-[11px] font-medium leading-[14px] px-[9px] py-[3px] rounded-full"
        :class="[TRACK_BADGE[session.track].bg, TRACK_BADGE[session.track].text]"
      >
        {{ TRACK_BADGE[session.track].label }}
      </span>

      <div
        class="w-4 h-4 rounded-[2px] flex items-center justify-center shrink-0"
        :class="selected
          ? 'bg-brand-emphasis-rest'
          : 'bg-surface-l0 border border-neutral-muted'"
      >
        <q-icon v-if="selected" name="check" size="10px" class="text-inverse" />
      </div>
    </div>

    <!-- Title -->
    <p
      class="text-subtitle1 m-0 leading-5"
      :class="isSoldOut ? 'text-neutral-disabled' : 'text-neutral'"
    >
      {{ session.title }}
    </p>

    <!-- Speaker -->
    <p
      class="text-xs m-0 leading-4"
      :class="isSoldOut ? 'text-neutral-disabled' : 'text-neutral-muted'"
    >
      {{ session.speaker }}, {{ session.speakerTitle }}
    </p>

    <!-- Time range -->
    <p
      class="text-[11px] leading-[14px] m-0"
      :class="isSoldOut ? 'text-neutral-disabled' : 'text-neutral-quiet'"
    >
      {{ formatTimeRange(session.date, session.endDate) }}
    </p>

    <!-- Capacity progress bar -->
    <div class="w-full h-1.5 rounded-full bg-surface-l2 overflow-hidden">
      <div
        class="h-full rounded-full transition-all"
        :class="isSoldOut ? 'bg-neutral-muted-rest' : 'bg-brand-emphasis-rest'"
        :style="{ width: `${fillPercent}%` }"
      />
    </div>

    <!-- Spots remaining / sold out -->
    <p class="text-[11px] leading-[14px] m-0 font-medium">
      <span v-if="isSoldOut" class="text-danger-emphasis font-semibold">Sold Out</span>
      <span v-else class="text-neutral-muted">
        {{ spotsLeft }} spot{{ spotsLeft === 1 ? '' : 's' }} left
      </span>
    </p>
  </div>
</template>
