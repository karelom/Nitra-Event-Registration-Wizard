<script setup lang="ts">
interface AttendeeInfoRowProps {
  label: string;
  value: string;
  hasError?: boolean;
}

withDefaults(defineProps<AttendeeInfoRowProps>(), {
  hasError: false,
});
</script>

<template>
  <div class="flex justify-between">
    <span class="text-xs text-neutral-muted leading-4">{{ label }}</span>
    <span
      class="text-xs leading-4"
      :class="hasError ? 'text-danger-emphasis' : 'text-neutral'"
    >
      {{ value }}
    </span>
  </div>
</template>
