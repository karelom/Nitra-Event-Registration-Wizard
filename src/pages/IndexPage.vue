<script setup>
import RegistrationWizard from "src/components/RegistrationWizard/RegistrationWizard.vue";
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="bg-surface-l1 flex flex-center">
        <div class="wizard-container full-width q-pa-lg">
          <RegistrationWizard />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped></style>
