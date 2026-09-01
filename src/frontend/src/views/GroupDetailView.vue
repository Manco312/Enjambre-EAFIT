<script setup lang="ts">
/* External Imports */
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/* Internal Imports */
import AppButton from '@/components/AppButton.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import type { GroupInterface } from '@/interfaces/GroupInterface';
import type { Nullable } from '@/types/Nullable';
import { CommitteeService } from '@/services/CommitteeService';
import { GroupService } from '@/services/GroupService';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { UserService } from '@/services/UserService';

/* Types */
interface UpcomingModule {
  icon: string;
  title: string;
  description: string;
}

/* Variables */
const route = useRoute();
const router = useRouter();

const upcomingModules: UpcomingModule[] = [
  {
    icon: 'fa-database',
    title: 'Base de datos del grupo',
    description: 'Registro y gestión de miembros. Disponible en la parte 2.',
  },
  {
    icon: 'fa-list-check',
    title: 'Tabla de permanencia',
    description: 'Seguimiento de actividades y porcentajes. Disponible en la parte 3.',
  },
];

/* Reactive Variables */
const isDeleteOpen = ref<boolean>(false);

/* Selectors */
const groupId = computed<number>(() => Number(route.params.id));
const group = computed<Nullable<GroupInterface>>(() => GroupService.getGroupById(groupId.value));
const committees = computed<CommitteeInterface[]>(() =>
  CommitteeService.getCommitteesByGroupId(groupId.value),
);
const boardUsername = computed<string>(
  () => UserService.getBoardUserByGroupId(groupId.value)?.username ?? '',
);
const deleteMessage = computed<string>(
  () =>
    `Se eliminará «${group.value?.name ?? ''}», sus ${committees.value.length} comité(s) y la cuenta de su junta directiva. Esta acción no se puede deshacer.`,
);

/* Functions */
function goBack(): void {
  void router.push({ name: ROUTE_NAMES.ADMIN_GROUPS });
}

function goToEdit(): void {
  void router.push({ name: ROUTE_NAMES.ADMIN_GROUP_EDIT, params: { id: String(groupId.value) } });
}

function handleDelete(): void {
  GroupService.deleteGroup(groupId.value);
  isDeleteOpen.value = false;
  void router.push({ name: ROUTE_NAMES.ADMIN_GROUPS });
}
</script>

<template>
  <section class="mx-auto max-w-4xl space-y-6">
    <button
      type="button"
      class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-700"
      @click="goBack"
    >
      <i class="fa-solid fa-arrow-left" />
      Volver a grupos
    </button>

    <div
      v-if="group === null"
      class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"
    >
      <p class="text-sm text-slate-500">El grupo solicitado no existe.</p>
      <AppButton class="mt-4" variant="secondary" @click="goBack">Volver</AppButton>
    </div>

    <template v-else>
      <div class="rounded-2xl border border-slate-200 bg-white p-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span class="text-xs font-semibold tracking-wide text-brand-700 uppercase">
              Grupo #{{ group.id }}
            </span>
            <h2 class="mt-2 text-2xl font-black text-ink">{{ group.name }}</h2>
          </div>
          <div class="flex gap-2">
            <AppButton variant="secondary" @click="goToEdit">
              <i class="fa-solid fa-pen" />
              Editar
            </AppButton>
            <AppButton variant="danger" @click="isDeleteOpen = true">
              <i class="fa-solid fa-trash" />
              Eliminar
            </AppButton>
          </div>
        </div>

        <div class="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 class="text-sm font-bold text-slate-500">Cuenta de la junta directiva</h3>
            <p class="mt-2 flex items-center gap-2 text-sm text-ink">
              <i class="fa-solid fa-user-shield text-slate-400" />
              {{ boardUsername || 'sin cuenta asociada' }}
            </p>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-500">Comités / Departamentos</h3>
            <ul class="mt-2 space-y-1.5">
              <li
                v-for="committee in committees"
                :key="committee.id"
                class="flex items-center gap-2 text-sm text-ink"
              >
                <i class="fa-solid fa-sitemap text-slate-400" />
                {{ committee.name }}
              </li>
              <li v-if="committees.length === 0" class="text-sm text-slate-400">
                Sin comités registrados.
              </li>
            </ul>
          </div>
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

      <ConfirmDialog
        :open="isDeleteOpen"
        title="Eliminar grupo"
        :message="deleteMessage"
        confirm-label="Eliminar grupo"
        tone="danger"
        @confirm="handleDelete"
        @cancel="isDeleteOpen = false"
      />
    </template>
  </section>
</template>
