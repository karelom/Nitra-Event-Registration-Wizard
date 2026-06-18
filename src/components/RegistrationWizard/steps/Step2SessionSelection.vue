<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { fetchSessions } from "src/api/sessions";
import type { Session } from "src/api/sessions";
import { useRegistration, useValidation } from "src/stores/registration";
import SessionCard from "src/components/RegistrationWizard/steps/SessionCard.vue";
import AppTabs from "src/components/shared/AppTabs.vue";

const registration = useRegistration();
const { fieldError, conflictingSessionIds } = useValidation();

const sessions = ref<Session[]>([]);
const loading = ref(true);

onMounted(async () => {
  sessions.value = await fetchSessions();
  loading.value = false;
});

const sessionsByDate = computed(() => {
  const groups = new Map<string, Session[]>();
  for (const s of sessions.value) {
    const key = s.date.slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  return groups;
});

const tabOptions = computed(() =>
  [...sessionsByDate.value.keys()].map((key) => ({
    value: key,
    label: new Date(key + "T00:00:00Z").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
  })),
);

const _activeTab = ref("");
const activeTab = computed({
  get: () => _activeTab.value || tabOptions.value[0]?.value || "",
  set: (v: string) => { _activeTab.value = v; },
});

const activeItems = computed(
  () => sessionsByDate.value.get(activeTab.value) ?? [],
);

const selectedCount = computed(() => registration.selectedSessionIds.length);

function isSelected(id: string): boolean {
  return registration.selectedSessionIds.includes(id);
}

function toggleSession(id: string): void {
  const ids = registration.selectedSessionIds;
  const idx = ids.indexOf(id);
  if (idx >= 0) ids.splice(idx, 1);
  else ids.push(id);
}
</script>

<template>
  <div class="flex flex-col gap-6 py-10 px-[120px]">
    <h2 class="text-h3 text-neutral m-0">Select Sessions</h2>

    <template v-if="loading">
      <div class="flex gap-1 p-1 rounded-[10px] bg-surface-l2 self-start">
        <div
          v-for="n in 2"
          :key="n"
          class="w-24 h-8 rounded-[8px] bg-surface-l3 animate-pulse"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="n in 6"
          :key="n"
          class="h-44 rounded-[6px] bg-surface-l2 animate-pulse"
        />
      </div>
    </template>

    <template v-else>
      <AppTabs :options="tabOptions" v-model="activeTab" />

      <span v-if="selectedCount > 0" class="text-xs font-medium text-brand">
        {{ selectedCount }} session{{ selectedCount === 1 ? "" : "s" }} selected
      </span>

      <div class="grid grid-cols-2 gap-4">
        <SessionCard
          v-for="session in activeItems"
          :key="session.id"
          :session="session"
          :selected="isSelected(session.id)"
          :has-error="!!fieldError('selectedSessionIds') || conflictingSessionIds.has(session.id)"
          @toggle="toggleSession(session.id)"
        />
      </div>
    </template>
  </div>
</template>
