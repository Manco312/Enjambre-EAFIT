<script setup lang="ts">
/* External Imports */
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

/* Internal Imports */
import AppButton from '@/components/AppButton.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import GroupCard from '@/components/GroupCard.vue';
import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import type { GroupInterface } from '@/interfaces/GroupInterface';
import type { Nullable } from '@/types/Nullable';
import { CommitteeService } from '@/services/CommitteeService';
import { GroupService } from '@/services/GroupService';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { ToastService } from '@/services/ToastService';
import { resolveErrorMessage } from '@/utils/resolveErrorMessage';

/* Types */
interface GroupSummary {
  group: GroupInterface;
  committeeCount: number;
}

/* Variables */
const router = useRouter();

/* Reactive Variables */
const summaries = ref<GroupSummary[]>([]);
const isLoading = ref<boolean>(true);
const groupPendingDelete = ref<Nullable<GroupInterface>>(null);

/* Selectors */
const deleteMessage = computed<string>(() =>
  groupPendingDelete.value === null
    ? ''
    : `Se eliminará «${groupPendingDelete.value.name}», sus comités, estados, actividades y la cuenta de su junta directiva. Esta acción no se puede deshacer.`,
);

/* Functions */
async function load(): Promise<void> {
  isLoading.value = true;
  try {
    const [groups, committees] = await Promise.all([
      GroupService.getGroups(),
      CommitteeService.getCommittees(),
    ]);
    summaries.value = groups.map((group: GroupInterface) => ({
      group,
      committeeCount: committees.filter(
        (committee: CommitteeInterface) => committee.groupId === group.id,
      ).length,
    }));
  } catch (error: unknown) {
    ToastService.error(resolveErrorMessage(error));
  } finally {
    isLoading.value = false;
  }
}

function goToCreate(): void {
  void router.push({ name: ROUTE_NAMES.ADMIN_GROUP_CREATE });
}

function goToDetail(groupId: number): void {
  void router.push({ name: ROUTE_NAMES.ADMIN_GROUP_DETAIL, params: { id: String(groupId) } });
}

function goToEdit(groupId: number): void {
  void router.push({ name: ROUTE_NAMES.ADMIN_GROUP_EDIT, params: { id: String(groupId) } });
}

function requestDelete(groupId: number): void {
  groupPendingDelete.value =
    summaries.value.find((summary: GroupSummary) => summary.group.id === groupId)?.group ?? null;
}

async function confirmDelete(): Promise<void> {
  const target = groupPendingDelete.value;
  groupPendingDelete.value = null;
  if (target === null) {
    return;
  }

  try {
    await GroupService.deleteGroup(target.id);
    ToastService.success(`Grupo «${target.name}» eliminado.`);
    await load();
  } catch (error: unknown) {
    ToastService.error(resolveErrorMessage(error));
  }
}

function cancelDelete(): void {
  groupPendingDelete.value = null;
}

onMounted(() => {
  void load();
});
</script>

<template>
  <section class="mx-auto max-w-6xl space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-ink">Grupos estudiantiles</h2>
        <p class="text-sm text-slate-500">
          {{ summaries.length }} grupo(s) registrado(s) en la plataforma.
        </p>
      </div>
      <AppButton @click="goToCreate">
        <i class="fa-solid fa-plus" />
        Crear grupo
      </AppButton>
    </div>

    <p v-if="isLoading" class="text-sm text-slate-500">Cargando grupos…</p>

    <div
      v-else-if="summaries.length === 0"
      class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"
    >
      <p class="text-sm text-slate-500">Aún no hay grupos estudiantiles.</p>
      <AppButton class="mt-4" variant="secondary" @click="goToCreate">Crear el primero</AppButton>
    </div>

    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <GroupCard
        v-for="summary in summaries"
        :key="summary.group.id"
        :group="summary.group"
        :committee-count="summary.committeeCount"
        @select="goToDetail"
        @edit="goToEdit"
        @delete="requestDelete"
      />
    </div>

    <ConfirmDialog
      :open="groupPendingDelete !== null"
      title="Eliminar grupo"
      :message="deleteMessage"
      confirm-label="Eliminar grupo"
      tone="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>
