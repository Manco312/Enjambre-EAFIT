<script setup lang="ts">
/* External Imports */
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

/* Internal Imports */
import AlertBanner from '@/components/AlertBanner.vue';
import AppButton from '@/components/AppButton.vue';
import AppTextField from '@/components/AppTextField.vue';
import BrandMark from '@/components/BrandMark.vue';
import type { LoginDTO } from '@/dtos/LoginDTO';
import { AuthService } from '@/services/AuthService';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { resolveErrorMessage } from '@/utils/resolveErrorMessage';

/* Variables */
const router = useRouter();

/* Reactive Variables */
const credentials = reactive<LoginDTO>({ username: '', password: '' });
const errorMessage = ref<string>('');
const isSubmitting = ref<boolean>(false);

/* Functions */
function handleSubmit(): void {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    AuthService.login(credentials);
    void router.push({ name: AuthService.resolveHomeRouteName() });
  } catch (error: unknown) {
    errorMessage.value = resolveErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50">
    <header class="mx-auto w-full max-w-6xl px-6 py-6">
      <RouterLink :to="{ name: ROUTE_NAMES.LANDING }">
        <BrandMark />
      </RouterLink>
    </header>

    <main class="flex flex-1 items-center justify-center px-6 pb-16">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 class="text-xl font-bold text-ink">Iniciar sesión</h1>
        <p class="mt-1 text-sm text-slate-500">
          Ingresa con la cuenta de administración o la cuenta de tu junta directiva.
        </p>

        <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
          <AppTextField
            id="username"
            v-model="credentials.username"
            label="Usuario"
            placeholder="admin"
            autocomplete="username"
            required
          />
          <AppTextField
            id="password"
            v-model="credentials.password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />

          <AlertBanner v-if="errorMessage" type="error" :message="errorMessage" />

          <AppButton type="submit" block :disabled="isSubmitting">
            {{ isSubmitting ? 'Ingresando...' : 'Ingresar' }}
          </AppButton>
        </form>

        <div class="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p class="font-semibold text-slate-600">Cuentas de demostración</p>
          <p class="mt-1">
            Administrador — usuario: <code>admin</code> / contraseña: <code>admin123</code>
          </p>
          <p>
            Junta directiva — usuario: <code>junta.semillero</code> / contraseña:
            <code>junta123</code>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
