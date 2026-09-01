<script setup lang="ts">
/* External Imports */
import { computed } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';

/* Internal Imports */
import AppSidebar from '@/components/AppSidebar.vue';
import AppTopbar from '@/components/AppTopbar.vue';
import { AuthService } from '@/services/AuthService';
import { ROUTE_NAMES } from '@/constants/routeNames';

/* Variables */
const route = useRoute();
const router = useRouter();

/* Selectors */
const showAppChrome = computed<boolean>(
  () => AuthService.isAuthenticated() && route.meta.public !== true,
);

/* Functions */
function handleLogout(): void {
  AuthService.logout();
  void router.push({ name: ROUTE_NAMES.LOGIN });
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-ink">
    <div v-if="showAppChrome" class="flex min-h-screen">
      <AppSidebar />
      <div class="flex min-h-screen flex-1 flex-col lg:pl-64">
        <AppTopbar @logout="handleLogout" />
        <main class="flex-1 p-6">
          <RouterView />
        </main>
      </div>
    </div>
    <RouterView v-else />
  </div>
</template>
