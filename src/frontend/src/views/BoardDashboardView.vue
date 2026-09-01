<script setup lang="ts">
/* External Imports */
import { computed } from 'vue';

/* Internal Imports */
import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import type { GroupInterface } from '@/interfaces/GroupInterface';
import type { Nullable } from '@/types/Nullable';
import { AuthService } from '@/services/AuthService';
import { CommitteeService } from '@/services/CommitteeService';
import { GroupService } from '@/services/GroupService';

/* Types */
interface UpcomingModule {
  icon: string;
  title: string;
  description: string;
}

/* Variables */
const upcomingModules: UpcomingModule[] = [
  {
    icon: 'fa-database',
    title: 'Base de datos',
    description: 'Registra y actualiza los miembros de tu grupo. Disponible en la parte 2.',
  },
  {
    icon: 'fa-list-check',
    title: 'Tabla de permanencia',
    description: 'Gestiona actividades y porcentajes de participación. Disponible en la parte 3.',
  },
];

/* Selectors */
const groupId = computed<Nullable<number>>(() => AuthService.getSession()?.groupId ?? null);
const group = computed<Nullable<GroupInterface>>(() =>
  groupId.value === null ? null : GroupService.getGroupById(groupId.value),
);
const committees = computed<CommitteeInterface[]>(() =>
  groupId.value === null ? [] : CommitteeService.getCommitteesByGroupId(groupId.value),
);
</script>

<template>
  <section class="mx-auto max-w-4xl space-y-6">
    <div class="rounded-2xl border border-slate-200 bg-white p-8">
      <span class="text-xs font-semibold tracking-wide text-brand-700 uppercase">Mi grupo</span>
      <h2 class="mt-2 text-2xl font-black text-ink">
        {{ group?.name ?? 'Grupo no encontrado' }}
      </h2>

      <div class="mt-6">
        <h3 class="text-sm font-bold text-slate-500">Comités / Departamentos</h3>
        <ul class="mt-2 flex flex-wrap gap-2">
          <li
            v-for="committee in committees"
            :key="committee.id"
            class="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700"
          >
            {{ committee.name }}
          </li>
          <li v-if="committees.length === 0" class="text-sm text-slate-400">
            Sin comités registrados.
          </li>
        </ul>
      </div>
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <div
        v-for="moduleItem in upcomingModules"
        :key="moduleItem.title"
        class="rounded-xl border border-slate-200 bg-slate-50 p-5"
      >
        <div class="flex items-center gap-3">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-400"
          >
            <i class="fa-solid" :class="moduleItem.icon" />
          </span>
          <p class="text-sm font-bold text-ink">{{ moduleItem.title }}</p>
        </div>
        <p class="mt-3 text-sm text-slate-500">{{ moduleItem.description }}</p>
        <span
          class="mt-4 inline-block rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-500"
        >
          Próximamente
        </span>
      </div>
    </div>
  </section>
</template>
