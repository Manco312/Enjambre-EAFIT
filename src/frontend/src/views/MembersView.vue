<script setup lang="ts">
/* External Imports */
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/* Internal Imports */
import AppButton from '@/components/AppButton.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import MemberFormModal from '@/components/MemberFormModal.vue';
import MemberTable from '@/components/MemberTable.vue';
import type { CreateMemberDTO } from '@/dtos/CreateMemberDTO';
import type { GroupInterface } from '@/interfaces/GroupInterface';
import type { MemberInterface } from '@/interfaces/MemberInterface';
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
import { slugify } from '@/utils/slugify';

/* Types */
type ColumnFilters = Partial<Record<keyof MemberInterface, string>>;

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
const memberPendingDelete = ref<Nullable<MemberInterface>>(null);

/* Selectors */
const isAdminRoute = computed<boolean>(() => route.name === ROUTE_NAMES.ADMIN_GROUP_MEMBERS);

const groupId = computed<Nullable<number>>(() => {
  if (isAdminRoute.value) {
    return Number(route.params.id);
  }
  return AuthService.getSession()?.groupId ?? null;
});

const group = computed<Nullable<GroupInterface>>(() =>
  groupId.value === null ? null : GroupService.getGroupById(groupId.value),
);

const allMembers = computed<MemberInterface[]>(() =>
  groupId.value === null ? [] : MemberService.getMembersByGroupId(groupId.value),
);

const areaOptions = computed<string[]>(() =>
  groupId.value === null
    ? []
    : CommitteeService.getCommitteesByGroupId(groupId.value).map((committee) => committee.name),
);

const statusOptions = computed<string[]>(() =>
  groupId.value === null
    ? []
    : MemberStatusService.getMemberStatusesByGroupId(groupId.value).map((status) => status.name),
);

const filteredMembers = computed<MemberInterface[]>(() =>
  MemberService.filterMembers(allMembers.value, { search: search.value, columnFilters }),
);

const totalPages = computed<number>(() =>
  Math.max(1, Math.ceil(filteredMembers.value.length / pageSize)),
);

const pagedMembers = computed<MemberInterface[]>(() => {
  const start = (page.value - 1) * pageSize;
  return filteredMembers.value.slice(start, start + pageSize);
});

/* Watchers */
watch(totalPages, (nextTotal: number): void => {
  if (page.value > nextTotal) {
    page.value = nextTotal;
  }
});

/* Functions */
function resetToFirstPage(): void {
  page.value = 1;
}

function onSearchInput(event: Event): void {
  search.value = (event.target as HTMLInputElement).value;
  resetToFirstPage();
}

function onFilterChange(key: keyof MemberInterface, value: string): void {
  columnFilters[key] = value;
  resetToFirstPage();
}

function onMemberUpdate(id: number, dto: UpdateMemberDTO): void {
  MemberService.updateMember(id, dto);
  ToastService.success('Cambios guardados.', 'member-inline-save');
}

function requestMemberDelete(id: number): void {
  memberPendingDelete.value = MemberService.getMemberById(id);
}

function confirmMemberDelete(): void {
  if (memberPendingDelete.value !== null) {
    const label = memberPendingDelete.value.name || memberPendingDelete.value.email || 'Integrante';
    MemberService.deleteMember(memberPendingDelete.value.id);
    ToastService.success(`«${label}» eliminado de la base de datos.`);
  }
  memberPendingDelete.value = null;
}

function addRowInline(): void {
  if (groupId.value === null) {
    return;
  }
  MemberService.createBlankMember(groupId.value);
  page.value = totalPages.value;
  ToastService.info('Fila agregada. Completa los datos del integrante.');
}

function onFormSubmit(dto: CreateMemberDTO): void {
  const member = MemberService.createMember(dto);
  isFormOpen.value = false;
  page.value = totalPages.value;
  ToastService.success(`Integrante «${member.name || member.email}» agregado.`);
}

async function exportToExcel(): Promise<void> {
  if (isExporting.value) {
    return;
  }
  isExporting.value = true;
  try {
    const groupName = group.value?.name ?? 'Integrantes';
    const blob = await ExcelExportService.buildMembersBlob(filteredMembers.value, groupName);
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

    <div
      v-if="group === null"
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
            Agregar con formulario
          </AppButton>
          <AppButton variant="secondary" @click="addRowInline">
            <i class="fa-solid fa-plus" />
            Agregar fila
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
        :area-options="areaOptions"
        :status-options="statusOptions"
        :column-filters="columnFilters"
        @update="onMemberUpdate"
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
        :area-options="areaOptions"
        :status-options="statusOptions"
        @submit="onFormSubmit"
        @close="isFormOpen = false"
      />

      <ConfirmDialog
        :open="memberPendingDelete !== null"
        title="Eliminar integrante"
        :message="`Se eliminará a «${memberPendingDelete?.name || memberPendingDelete?.email || 'este integrante'}» de la base de datos. Esta acción no se puede deshacer.`"
        confirm-label="Eliminar integrante"
        tone="danger"
        @confirm="confirmMemberDelete"
        @cancel="memberPendingDelete = null"
      />
    </template>
  </section>
</template>
