import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { AuthSessionInterface } from '@/interfaces/AuthSessionInterface';
import type { Nullable } from '@/types/Nullable';

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Nullable<AuthSessionInterface>>(null);

  function setSession(nextSession: Nullable<AuthSessionInterface>): void {
    session.value = nextSession;
  }

  return { session, setSession };
});
