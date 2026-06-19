<script setup lang="ts">
interface AppTabsProps {
  options: { value: string; label: string }[]
}

defineProps<AppTabsProps>()
const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="flex gap-1 p-1 rounded-[10px] bg-surface-l2 self-start">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="px-5 py-2 rounded-lg text-sm font-semibold transition-colors border-none cursor-pointer"
      :class="model === opt.value
        ? 'bg-brand-emphasis-rest text-inverse'
        : 'bg-transparent text-neutral-muted'"
      @click="model = opt.value"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
