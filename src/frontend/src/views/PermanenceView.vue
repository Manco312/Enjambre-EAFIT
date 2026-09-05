<script setup lang="ts">
/* External Imports */
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/* Internal Imports */
import ActivityFormModal from '@/components/ActivityFormModal.vue';
import AppButton from '@/components/AppButton.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import PermanenceTable from '@/components/PermanenceTable.vue';
import type { ActivityFormPayload } from '@/components/ActivityFormModal.vue';
import type { ActivityInterface } from '@/interfaces/ActivityInterface';
import type { GroupInterface } from '@/interfaces/GroupInterface';
import type { Nullable } from '@/types/Nullable';
import type {
  PermanenceSheetKey,
  PermanenceSheetOption,
  PermanenceSheetView,
} from '@/services/PermanenceSheetService';
import { ActivityService } from '@/services/ActivityService';
import { AuthService } from '@/services/AuthService';
import { ExcelExportService } from '@/services/ExcelExportService';
import { GroupService } from '@/services/GroupService';
import { PermanenceSheetService } from '@/services/PermanenceSheetService';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { ToastService } from '@/services/ToastService';
import { downloadBlob } from '@/utils/downloadBlob';
import { slugify } from '@/utils/slugify';

/* Variables */
const route = useRoute();
const router = useRouter();

/* Reactive Variables */
const activeSheetKey = ref<PermanenceSheetKey>('general');
const isFormOpen = ref<boolean>(false);
const editingActivity = ref<Nullable<ActivityInterface>>(null);
const activityPendingDelete = ref<Nullable<ActivityInterface>>(null);
const isExporting = ref<boolean>(false);

/* Selectors */
const isAdminRoute = computed<boolean>(() => route.name === ROUTE_NAMES.ADMIN_GROUP_PERMANENCE);

const groupId = computed<Nullable<number>>(() => {
  if (isAdminRoute.value) {
    return Number(route.params.id);
  }
  return AuthService.getSession()?.groupId ?? null;
});

const group = computed<Nullable<GroupInterface>>(() =>
  groupId.value === null ? null : GroupService.getGroupById(groupId.value),
);

const sheetOptions = computed<PermanenceSheetOption[]>(() =>
  groupId.value === null ? [] : PermanenceSheetService.getSheetOptions(groupId.value),
);

const activeSheetLabel = computed<string>(
  () =>
    sheetOptions.value.find((option: PermanenceSheetOption) => option.key === activeSheetKey.value)
      ?.label ?? 'General',
);

const sheet = computed<Nullable<PermanenceSheetView>>(() =>
  groupId.value === null
    ? null
    : PermanenceSheetService.buildSheet(groupId.value, activeSheetKey.value),
);

const deleteMessage = computed<string>(() =>
  activityPendingDelete.value === null
    ? ''
    : `Se eliminará la actividad «${activityPendingDelete.value.name}» y todos los valores registrados de los integrantes. Esta acción no se puede deshacer.`,
);

/* Watchers */
watch(sheetOptions, (options: PermanenceSheetOption[]): void => {
  const stillExists = options.some(
    (option: PermanenceSheetOption) => option.key === activeSheetKey.value,
  );
  if (!stillExists) {
    activeSheetKey.value = 'general';
  }
});

/* Functions */
function selectSheet(key: PermanenceSheetKey): void {
  activeSheetKey.value = key;
}

function openCreate(): void {
  editingActivity.value = null;
  isFormOpen.value = true;
}

function openEdit(activityId: number): void {
  editingActivity.value = ActivityService.getActivityById(activityId);
  isFormOpen.value = true;
}

function onFormSubmit(payload: ActivityFormPayload): void {
  if (groupId.value === null) {
    return;
  }

  if (editingActivity.value !== null) {
    ActivityService.updateActivity(editingActivity.value.id, payload);
    ToastService.success('Actividad actualizada.');
  } else {
    const key = activeSheetKey.value;
    ActivityService.createActivity({
      groupId: groupId.value,
      committeeId: key === 'general' ? null : key,
      name: payload.name,
      description: payload.description,
      weight: payload.weight,
      period: payload.period,
    });
    ToastService.success(`Actividad «${payload.name}» agregada.`);
  }

  isFormOpen.value = false;
  editingActivity.value = null;
}

function requestDeleteActivity(activityId: number): void {
  activityPendingDelete.value = ActivityService.getActivityById(activityId);
}

function confirmDeleteActivity(): void {
  if (activityPendingDelete.value !== null) {
    const name = activityPendingDelete.value.name;
    ActivityService.deleteActivity(activityPendingDelete.value.id);
    ToastService.success(`Actividad «${name}» eliminada.`);
  }
  activityPendingDelete.value = null;
}

function onSetValue(activityId: number, memberId: number, value: number): void {
  PermanenceSheetService.setValue(activityId, memberId, value);
  ToastService.success('Cambios guardados.', 'permanence-save');
}

async function exportToExcel(): Promise<void> {
  if (groupId.value === null || isExporting.value) {
    return;
  }
  isExporting.value = true;
  try {
    const groupName = group.value?.name ?? 'Permanencia';
    const blob = await ExcelExportService.buildPermanenceBlob(groupId.value);
    downloadBlob(blob, `${slugify(groupName) || 'grupo'}-permanencia.xlsx`);
    ToastService.success('Tabla de permanencia exportada a Excel.');
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
          <h2 class="text-xl font-bold text-ink">Tabla de permanencia</h2>
          <p class="text-sm text-slate-500">{{ group.name }} — hoja «{{ activeSheetLabel }}»</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <AppButton variant="secondary" @click="openCreate">
            <i class="fa-solid fa-plus" />
            Agregar actividad
          </AppButton>
          <AppButton :disabled="isExporting" @click="handleExportClick">
            <i class="fa-solid fa-file-excel" />
            {{ isExporting ? 'Exportando…' : 'Exportar a Excel' }}
          </AppButton>
        </div>
      </div>

      <div class="flex flex-wrap gap-1 border-b border-slate-200">
        <button
          v-for="option in sheetOptions"
          :key="String(option.key)"
          type="button"
          class="-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition"
          :class="
            option.key === activeSheetKey
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-brand-700'
          "
          @click="selectSheet(option.key)"
        >
          {{ option.label }}
        </button>
      </div>

      <p class="text-xs text-slate-400">
        En cada celda escribe los puntos obtenidos en esa actividad (máximo = su peso). El
        <strong>puntaje</strong> es la suma de puntos sobre el total de pesos de la hoja. Verde =
        cumple el objetivo de su estado de miembro; rojo = no lo cumple.
      </p>

      <PermanenceTable
        v-if="sheet !== null"
        :sheet="sheet"
        @set-value="onSetValue"
        @edit-activity="openEdit"
        @delete-activity="requestDeleteActivity"
      />

      <ActivityFormModal
        :open="isFormOpen"
        :sheet-label="activeSheetLabel"
        :activity="editingActivity"
        @submit="onFormSubmit"
        @close="isFormOpen = false"
      />

      <ConfirmDialog
        :open="activityPendingDelete !== null"
        title="Eliminar actividad"
        :message="deleteMessage"
        confirm-label="Eliminar actividad"
        tone="danger"
        @confirm="confirmDeleteActivity"
        @cancel="activityPendingDelete = null"
      />
    </template>
  </section>
</template>
