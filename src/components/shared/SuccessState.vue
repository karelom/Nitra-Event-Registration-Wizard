<script setup lang="ts">
import { useRegistration } from "src/stores/registration";

const registration = useRegistration();

function handleBackToHome() {
  globalThis.location.reload();
}
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-1 gap-4 px-8 py-[60px]">
    <!-- Success icon -->
    <div
      class="w-20 h-20 rounded-full bg-[#15B471] flex items-center justify-center"
    >
      <q-icon name="check" size="36px" class="text-inverse" />
    </div>

    <h1 class="text-[28px] font-bold leading-8 text-success-emphasis m-0 text-center">
      Registration Complete!
    </h1>

    <p class="text-base text-neutral m-0 text-center leading-6">
      Confirmation #TC2025-47291
    </p>

    <p class="text-xs text-neutral-muted text-center max-w-md m-0 leading-4">
      Thank you, {{ registration.attendeeInfo.fullName }}! Your
      {{ registration.attendeeInfo.ticketId.toUpperCase() }} registration is confirmed.<br />
      You will receive a confirmation email at {{ registration.attendeeInfo.email }}.
    </p>

    <q-btn
      label="Back to Home"
      unelevated
      padding="10px 16px"
      class="mt-2 bg-accent-emphasis-rest text-inverse rounded-[10px] text-sm font-semibold"
      @click="handleBackToHome"
    />
  </div>
</template>
