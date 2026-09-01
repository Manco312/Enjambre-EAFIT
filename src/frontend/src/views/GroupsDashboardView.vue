<script setup lang="ts">
/* External Imports */
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

/* Internal Imports */
import AppButton from '@/components/AppButton.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import GroupCard from '@/components/GroupCard.vue';
import type { GroupInterface } from '@/interfaces/GroupInterface';
import type { Nullable } from '@/types/Nullable';
import { CommitteeService } from '@/services/CommitteeService';
import { GroupService } from '@/services/GroupService';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { UserService } from '@/services/UserService';

/* Types */
interface GroupSummary {
  group: GroupInterface;
  committeeCount: number;
  boardUsername: string;
}

/* Variables */
const router = useRouter();

/* Reactive Variables */
const groupPendingDelete = ref<Nullable<GroupInterface>>(null);

/* Selectors */
const groupSummaries = computed<GroupSummary[]>(() =>
  GroupService.getGroups().map((group: GroupInterface) => ({
    group,
    committeeCount: CommitteeService.getCommitteesByGroupId(group.id).length,
    boardUsername: UserService.getBoardUserByGroupId(group.id)?.username ?? '',
  })),
);
const deleteMessage = computed<string>(() => {
  const target = groupPendingDelete.value;
  if (target === null) {
    return '';
  }
  const committeeCount = CommitteeService.getCommitteesByGroupId(target.id).length;
  return `Se eliminará «${target.name}», sus ${committeeCount} comité(s) y la cuenta de su junta directiva. Esta acción no se puede deshacer.`;
});

/* Functions */
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
  groupPendingDelete.value = GroupService.getGroupById(groupId);
}

function confirmDelete(): void {
  if (groupPendingDelete.value !== null) {
    GroupService.deleteGroup(groupPendingDelete.value.id);
  }
  groupPendingDelete.value = null;
}

function cancelDelete(): void {
  groupPendingDelete.value = null;
}
</script>

<template>
  <section class="mx-auto max-w-6xl space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-ink">Grupos estudiantiles</h2>
        <p class="text-sm text-slate-500">
          {{ groupSummaries.length }} grupo(s) registrado(s) en la plataforma.
        </p>
      </div>
      <AppButton @click="goToCreate">
        <i class="fa-solid fa-plus" />
        Crear grupo
      </AppButton>
    </div>

    <div
      v-if="groupSummaries.length === 0"
      class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"
    >
      <p class="text-sm text-slate-500">Aún no hay grupos estudiantiles.</p>
      <AppButton class="mt-4" variant="secondary" @click="goToCreate">Crear el primero</AppButton>
    </div>

    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <GroupCard
        v-for="summary in groupSummaries"
        :key="summary.group.id"
        :group="summary.group"
        :committee-count="summary.committeeCount"
        :board-username="summary.boardUsername"
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
