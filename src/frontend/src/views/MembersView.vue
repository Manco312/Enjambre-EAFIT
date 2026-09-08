<script setup lang="ts">
/* External Imports */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/* Internal Imports */
import AppButton from '@/components/AppButton.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import MemberFormModal from '@/components/MemberFormModal.vue';
import MemberTable from '@/components/MemberTable.vue';
import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import type { CreateMemberDTO } from '@/dtos/CreateMemberDTO';
import type { GroupInterface } from '@/interfaces/GroupInterface';
import type { MemberLookups, MemberWithMembership } from '@/services/MemberService';
import type { MemberStatusInterface } from '@/interfaces/MemberStatusInterface';
import type { Nullable } from '@/types/Nullable';
import type { UpdateMemberDTO } from '@/dtos/UpdateMemberDTO';
import { AuthService } from '@/services/AuthService';
import { CommitteeService } from '@/services/CommitteeService';
import { ExcelExportService } from '@/services/ExcelExportService';
import { GroupService } from '@/services/GroupService';
import { MemberService } from '@/services/MemberService';
import { MemberStatusService } from '@/services/MemberStatusService';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { ToastService } from '@/services/ToastService';
import { downloadBlob } from '@/utils/downloadBlob';
import { resolveErrorMessage } from '@/utils/resolveErrorMessage';
import { slugify } from '@/utils/slugify';

/* Types */
type ColumnFilters = Partial<Record<string, string>>;

/* Variables */
const route = useRoute();
const router = useRouter();
const pageSize = 20;

/* Reactive Variables */
const search = ref<string>('');
const columnFilters = reactive<ColumnFilters>({});
const page = ref<number>(1);
const isFormOpen = ref<boolean>(false);
const isExporting = ref<boolean>(false);
const isLoading = ref<boolean>(true);
const memberPendingDelete = ref<Nullable<MemberWithMembership>>(null);

const group = ref<Nullable<GroupInterface>>(null);
const allMembers = ref<MemberWithMembership[]>([]);
const committees = ref<CommitteeInterface[]>([]);
const statuses = ref<MemberStatusInterface[]>([]);

/* Selectors */
const isAdminRoute = computed<boolean>(() => route.name === ROUTE_NAMES.ADMIN_GROUP_MEMBERS);

const groupId = computed<Nullable<number>>(() => {
  if (isAdminRoute.value) {
    return Number(route.params.id);
  }
  return AuthService.getSession()?.groupId ?? null;
});

const lookups = computed<MemberLookups>(() => ({
  committees: committees.value,
  statuses: statuses.value,
}));

const filteredMembers = computed<MemberWithMembership[]>(() =>
  MemberService.filterMembers(
    allMembers.value,
    { search: search.value, columnFilters },
    lookups.value,
  ),
);

const totalPages = computed<number>(() =>
  Math.max(1, Math.ceil(filteredMembers.value.length / pageSize)),
);

const pagedMembers = computed<MemberWithMembership[]>(() => {
  const start = (page.value - 1) * pageSize;
  return filteredMembers.value.slice(start, start + pageSize);
});

/* Watchers */
watch(totalPages, (nextTotal: number): void => {
  if (page.value > nextTotal) {
    page.value = nextTotal;
  }
});

watch(groupId, () => {
  void load();
});

/* Functions */
async function load(): Promise<void> {
  if (groupId.value === null) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  try {
    const [foundGroup, members, foundCommittees, foundStatuses] = await Promise.all([
      GroupService.getGroupById(groupId.value),
      MemberService.getMembersByGroupId(groupId.value),
      CommitteeService.getCommitteesByGroupId(groupId.value),
      MemberStatusService.getMemberStatusesByGroupId(groupId.value),
    ]);
    group.value = foundGroup;
    allMembers.value = members;
    committees.value = foundCommittees;
    statuses.value = foundStatuses;
  } catch (error: unknown) {
    ToastService.error(resolveErrorMessage(error));
  } finally {
    isLoading.value = false;
  }
}

function resetToFirstPage(): void {
  page.value = 1;
}

function onSearchInput(event: Event): void {
  search.value = (event.target as HTMLInputElement).value;
  resetToFirstPage();
}

function onFilterChange(key: string, value: string): void {
  columnFilters[key] = value;
  resetToFirstPage();
}

function patchLocalMember(id: number, changes: Partial<MemberWithMembership>): void {
  allMembers.value = allMembers.value.map((member: MemberWithMembership) =>
    member.id === id ? { ...member, ...changes } : member,
  );
}

async function onMemberUpdate(id: number, dto: UpdateMemberDTO): Promise<void> {
  try {
    await MemberService.updateMember(id, dto);
    patchLocalMember(id, dto as Partial<MemberWithMembership>);
    ToastService.success('Cambios guardados.', 'member-inline-save');
  } catch (error: unknown) {
    ToastService.error(resolveErrorMessage(error), 'member-inline-save');
    void load();
  }
}

async function onMemberStatusUpdate(id: number, memberStatusId: number): Promise<void> {
  if (groupId.value === null) {
    return;
  }
  try {
    await MemberService.updateMemberStatus(id, groupId.value, memberStatusId);
    patchLocalMember(id, { memberStatusId });
    ToastService.success('Cambios guardados.', 'member-inline-save');
  } catch (error: unknown) {
    ToastService.error(resolveErrorMessage(error), 'member-inline-save');
    void load();
  }
}

function requestMemberDelete(id: number): void {
  memberPendingDelete.value =
    allMembers.value.find((member: MemberWithMembership) => member.id === id) ?? null;
}

async function confirmMemberDelete(): Promise<void> {
  const target = memberPendingDelete.value;
  memberPendingDelete.value = null;
  if (target === null) {
    return;
  }

  try {
    await MemberService.deleteMember(target.id);
    ToastService.success(
      `«${MemberService.getDisplayName(target)}» eliminado de la base de datos.`,
    );
    await load();
  } catch (error: unknown) {
    ToastService.error(resolveErrorMessage(error));
  }
}

async function onFormSubmit(dto: CreateMemberDTO): Promise<void> {
  try {
    const member = await MemberService.createMember(dto);
    isFormOpen.value = false;
    await load();
    page.value = totalPages.value;
    ToastService.success(`Integrante «${MemberService.getDisplayName(member)}» agregado.`);
  } catch (error: unknown) {
    ToastService.error(resolveErrorMessage(error));
  }
}

async function exportToExcel(): Promise<void> {
  if (isExporting.value) {
    return;
  }
  isExporting.value = true;
  try {
    const groupName = group.value?.name ?? 'Integrantes';
    const blob = await ExcelExportService.buildMembersBlob(
      filteredMembers.value,
      groupName,
      lookups.value,
    );
    downloadBlob(blob, `${slugify(groupName) || 'integrantes'}-integrantes.xlsx`);
    ToastService.success(`Excel generado con ${filteredMembers.value.length} integrante(s).`);
  } catch {
    ToastService.error('No se pudo generar el archivo de Excel.');
  } finally {
    isExporting.value = false;
  }
}

function handleExportClick(): void {
  void exportToExcel();
}

function goBack(): void {
  if (isAdminRoute.value && groupId.value !== null) {
    void router.push({
      name: ROUTE_NAMES.ADMIN_GROUP_DETAIL,
      params: { id: String(groupId.value) },
    });
    return;
  }
  void router.push({ name: ROUTE_NAMES.BOARD_HOME });
}

onMounted(() => {
  void load();
});
</script>

<template>
  <section class="mx-auto max-w-[110rem] space-y-6">
    <button
      type="button"
      class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-700"
      @click="goBack"
    >
      <i class="fa-solid fa-arrow-left" />
      Volver
    </button>

    <p v-if="isLoading" class="text-sm text-slate-500">Cargando integrantes…</p>

    <div
      v-else-if="group === null"
      class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"
    >
      <p class="text-sm text-slate-500">No se encontró el grupo estudiantil.</p>
    </div>

    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-ink">Base de datos de integrantes</h2>
          <p class="text-sm text-slate-500">
            {{ group.name }} — {{ filteredMembers.length }} de {{ allMembers.length }} integrante(s)
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <AppButton variant="secondary" @click="isFormOpen = true">
            <i class="fa-solid fa-user-plus" />
            Agregar integrante
          </AppButton>
          <AppButton :disabled="isExporting" @click="handleExportClick">
            <i class="fa-solid fa-file-excel" />
            {{ isExporting ? 'Exportando…' : 'Exportar a Excel' }}
          </AppButton>
        </div>
      </div>

      <div class="relative max-w-sm">
        <i
          class="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-xs text-slate-400"
        />
        <input
          type="search"
          placeholder="Buscar por nombre, correo, documento…"
          class="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          :value="search"
          @input="onSearchInput"
        />
      </div>

      <MemberTable
        :members="pagedMembers"
        :committees="committees"
        :statuses="statuses"
        :column-filters="columnFilters"
        @update="onMemberUpdate"
        @update-status="onMemberStatusUpdate"
        @delete="requestMemberDelete"
        @filter-change="onFilterChange"
      />

      <div class="flex items-center justify-between text-sm text-slate-500">
        <span>Página {{ page }} de {{ totalPages }}</span>
        <div class="flex gap-2">
          <AppButton variant="secondary" :disabled="page <= 1" @click="page -= 1">
            <i class="fa-solid fa-chevron-left" />
            Anterior
          </AppButton>
          <AppButton variant="secondary" :disabled="page >= totalPages" @click="page += 1">
            Siguiente
            <i class="fa-solid fa-chevron-right" />
          </AppButton>
        </div>
      </div>

      <MemberFormModal
        :open="isFormOpen"
        :group-id="groupId ?? 0"
        :committees="committees"
        :statuses="statuses"
        @submit="onFormSubmit"
        @close="isFormOpen = false"
      />

      <ConfirmDialog
        :open="memberPendingDelete !== null"
        title="Eliminar integrante"
        :message="`Se eliminará a «${memberPendingDelete !== null ? MemberService.getDisplayName(memberPendingDelete) : 'este integrante'}» de la base de datos. Esta acción no se puede deshacer.`"
        confirm-label="Eliminar integrante"
        tone="danger"
        @confirm="confirmMemberDelete"
        @cancel="memberPendingDelete = null"
      />
    </template>
  </section>
</template>
