<script setup lang="ts">
/* External Imports */
import { useRouter } from 'vue-router';

/* Internal Imports */
import AppButton from '@/components/AppButton.vue';
import { AuthService } from '@/services/AuthService';
import { ROUTE_NAMES } from '@/constants/routeNames';

/* Variables */
const router = useRouter();

/* Functions */
function goHome(): void {
  const target = AuthService.isAuthenticated()
    ? AuthService.resolveHomeRouteName()
    : ROUTE_NAMES.LANDING;
  void router.push({ name: target });
}
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center"
  >
    <p class="text-5xl font-black text-brand-700">404</p>
    <p class="text-sm text-slate-500">La página que buscas no existe.</p>
    <AppButton @click="goHome">Volver al inicio</AppButton>
  </div>
</template>
