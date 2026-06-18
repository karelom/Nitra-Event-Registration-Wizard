<script setup lang="ts">
interface AppInputProps {
  label?: string
  placeholder?: string
  type?: string
  error?: string
}

const props = withDefaults(defineProps<AppInputProps>(), { type: 'text' })

/** Bidirectional binding for the input value. */
const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="flex flex-col gap-1.5 flex-1 min-w-0">
    <label
      v-if="label"
      class="text-xs font-medium leading-4 select-none"
      :class="props.error ? 'text-danger-emphasis' : 'text-neutral'"
    >
      {{ label }}
    </label>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      class="w-full px-3 py-2.5 text-base font-regular bg-surface-l0 rounded-[6px] text-neutral placeholder:text-neutral-quiet leading-6 focus:outline-none transition-colors"
      :class="props.error
        ? 'border border-danger-emphasis'
        : 'border-2 border-neutral-muted focus:border-brand-emphasis'"
    />
    <span v-if="props.error" class="text-[11px] text-danger-emphasis leading-[14px]">
      {{ props.error }}
    </span>
  </div>
</template>
