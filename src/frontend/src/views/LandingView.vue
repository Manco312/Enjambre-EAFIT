<script setup lang="ts">
/* External Imports */
import { useRouter } from 'vue-router';

/* Internal Imports */
import AppButton from '@/components/AppButton.vue';
import BrandMark from '@/components/BrandMark.vue';
import { ENVIRONMENT } from '@/constants/environment';
import { ROUTE_NAMES } from '@/constants/routeNames';

/* Types */
interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

/* Variables */
const router = useRouter();

const features: FeatureItem[] = [
  {
    icon: 'fa-database',
    title: 'Base de datos centralizada',
    description:
      'Una única fuente de verdad para los miembros de cada grupo estudiantil, sin archivos de Excel dispersos.',
  },
  {
    icon: 'fa-list-check',
    title: 'Control de permanencia',
    description:
      'Seguimiento del cumplimiento de requisitos de permanencia por miembro y por actividad.',
  },
  {
    icon: 'fa-user-gear',
    title: 'Roles diferenciados',
    description:
      'Desarrollo Estudiantil administra los grupos; cada junta directiva gestiona su propia información.',
  },
];

/* Functions */
function goToLogin(): void {
  void router.push({ name: ROUTE_NAMES.LOGIN });
}
</script>

<template>
  <div class="min-h-screen bg-white text-ink">
    <header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <BrandMark />
      <AppButton variant="secondary" @click="goToLogin">Iniciar sesión</AppButton>
    </header>

    <section class="mx-auto max-w-6xl px-6 pt-12 pb-20">
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span
            class="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold tracking-wide text-brand-700 uppercase"
          >
            {{ ENVIRONMENT.APP_INSTITUTION }}
          </span>
          <h1 class="mt-5 text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Gestión centralizada de los Grupos Estudiantiles
          </h1>
          <p class="mt-5 max-w-xl text-base text-slate-600">
            {{ ENVIRONMENT.APP_DESCRIPTION }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <AppButton @click="goToLogin">
              Ingresar a la plataforma
              <i class="fa-solid fa-arrow-right" />
            </AppButton>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-8">
          <div class="space-y-4">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="flex gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white"
              >
                <i class="fa-solid" :class="feature.icon" />
              </span>
              <div>
                <p class="text-sm font-bold text-ink">{{ feature.title }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="border-t border-slate-200 py-6">
      <p class="mx-auto max-w-6xl px-6 text-xs text-slate-400">
        {{ ENVIRONMENT.APP_NAME }} — {{ ENVIRONMENT.APP_INSTITUTION }}. Proyecto académico.
      </p>
    </footer>
  </div>
</template>
