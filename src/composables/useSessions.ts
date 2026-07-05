import { ref, computed, onMounted } from 'vue'
import { fetchSessions } from 'src/api/sessions'
import type { Session } from 'src/api/sessions'
import { useRegistration } from 'src/stores/registration'

/**
 * Fetches all sessions on mount and exposes the subset the attendee has selected.
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
