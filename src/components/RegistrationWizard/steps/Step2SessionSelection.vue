<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchSessions } from 'src/api/sessions'
import type { Session } from 'src/api/sessions'
import { useRegistration } from 'src/stores/registration'
import SessionCard from 'src/components/RegistrationWizard/steps/SessionCard.vue'

const registration = useRegistration()
const sessions = ref<Session[]>([])
const loading = ref(true)
const activeDate = ref('')

onMounted(async () => {
  const data = await fetchSessions()
  sessions.value = data
  loading.value = false
  if (dates.value.length > 0) activeDate.value = dates.value[0]
})

/** Sessions grouped by YYYY-MM-DD date key, preserving mock sort order. */
const groupedSessions = computed(() => {
  const groups = new Map<string, Session[]>()
  for (const s of sessions.value) {
    const key = s.date.slice(0, 10)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s)
  }
  return groups
})

/** Sorted date keys derived from grouped sessions. */
const dates = computed(() => [...groupedSessions.value.keys()])

/** Sessions visible under the active date tab. */
const activeSessions = computed(() => groupedSessions.value.get(activeDate.value) ?? [])

const selectedCount = computed(() => registration.selectedSessionIds.length)

function isSelected(id: string): boolean {
  return registration.selectedSessionIds.includes(id)
}

function toggleSession(id: string): void {
  const ids = registration.selectedSessionIds
  const idx = ids.indexOf(id)
  if (idx >= 0) ids.splice(idx, 1)
  else ids.push(id)
}

/** "Nov 15" from a YYYY-MM-DD key. */
function formatTabDate(dateKey: string): string {
  return new Date(dateKey + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
</script>

<template>
  <div class="flex flex-col gap-6 py-10 px-[120px]">

    <h2 class="text-h3 text-neutral m-0">Select Sessions</h2>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="flex gap-1 p-1 rounded-[10px] bg-surface-l2 self-start">
        <div v-for="n in 2" :key="n" class="w-24 h-8 rounded-[8px] bg-surface-l3 animate-pulse" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div v-for="n in 6" :key="n" class="h-44 rounded-[6px] bg-surface-l2 animate-pulse" />
      </div>
    </template>

    <template v-else>
      <!-- Date tabs -->
      <div class="flex gap-1 p-1 rounded-[10px] bg-surface-l2 self-start">
        <button
          v-for="dateKey in dates"
          :key="dateKey"
          class="px-5 py-2 rounded-[8px] text-sm font-semibold transition-colors border-none cursor-pointer"
          :class="activeDate === dateKey
            ? 'bg-brand-emphasis-rest text-inverse'
            : 'bg-transparent text-neutral-muted'"
          @click="activeDate = dateKey"
        >
          {{ formatTabDate(dateKey) }}
        </button>
      </div>

      <!-- Selected count -->
      <span v-if="selectedCount > 0" class="text-xs font-medium text-brand">
        {{ selectedCount }} session{{ selectedCount === 1 ? '' : 's' }} selected
      </span>

      <!-- Session grid -->
      <div class="grid grid-cols-2 gap-4">
        <SessionCard
          v-for="session in activeSessions"
          :key="session.id"
          :session="session"
          :selected="isSelected(session.id)"
          @toggle="toggleSession(session.id)"
        />
      </div>
    </template>

  </div>
</template>
