<script setup lang="ts">
interface AppInputProps {
  label?: string
  placeholder?: string
  type?: string
}

withDefaults(defineProps<AppInputProps>(), { type: 'text' })

/** Bidirectional binding for the input value. */
const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="flex flex-col gap-1.5 flex-1 min-w-0">
    <label v-if="label" class="text-xs font-medium text-neutral leading-4 select-none">
      {{ label }}
    </label>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      class="w-full px-3 py-2.5 text-base font-regular bg-surface-l0 border-2 border-neutral-muted rounded-[6px] text-neutral placeholder:text-neutral-quiet leading-6 focus:outline-none focus:border-brand-emphasis transition-colors"
    />
  </div>
</template>
