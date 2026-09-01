<script setup lang="ts">
/* External Imports */
import { computed } from 'vue';
import { useRoute } from 'vue-router';

/* Internal Imports */
import { AuthService } from '@/services/AuthService';

/* Emits */
const emit = defineEmits<{ logout: [] }>();

/* Variables */
const route = useRoute();

/* Selectors */
const title = computed<string>(() => route.meta.title ?? '');
const username = computed<string>(() => AuthService.getSession()?.username ?? '');

/* Functions */
function handleLogout(): void {
  emit('logout');
}
</script>

<template>
  <header
    class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4"
  >
    <h1 class="text-lg font-bold text-ink">{{ title }}</h1>
    <div class="flex items-center gap-4">
      <span class="hidden text-sm text-slate-500 sm:inline">{{ username }}</span>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        @click="handleLogout"
      >
        <i class="fa-solid fa-arrow-right-from-bracket" />
        <span>Salir</span>
      </button>
    </div>
  </header>
</template>
