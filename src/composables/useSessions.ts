import { ref, computed, onMounted } from 'vue'
import { fetchSessions } from 'src/api/sessions'
import type { Session } from 'src/api/sessions'
import { useRegistration } from 'src/stores/registration'

/**
 * Fetches conference sessions on mount and exposes the subset currently
 * selected in the registration state. Shared by Step3 (conflict checks)
 * and Step4 (review).
 */
export function useSessions() {
  const registration = useRegistration()

  const sessions = ref<Session[]>([])
  const loading = ref(true)

  onMounted(async () => {
    sessions.value = await fetchSessions()
    loading.value = false
  })

  const selectedSessions = computed(() =>
    sessions.value.filter((s) => registration.selectedSessionIds.includes(s.id)),
  )

  return { sessions, loading, selectedSessions }
}
