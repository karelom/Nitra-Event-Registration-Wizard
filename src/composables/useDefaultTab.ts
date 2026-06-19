import { ref, computed, type ComputedRef, type WritableComputedRef } from 'vue'

/**
 * Writable computed that defaults to the first tab option.
 * Lazily initializes — if no explicit selection has been made, returns the first available option.
 */
export function useDefaultTab(
  tabOptions: ComputedRef<{ value: string }[]>,
): WritableComputedRef<string> {
  const _tab = ref('')
  return computed({
    get: () => _tab.value || tabOptions.value[0]?.value || '',
    set: (v: string) => { _tab.value = v },
  })
}
