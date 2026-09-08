<script setup lang="ts">
/* External Imports */
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/* Internal Imports */
import AlertBanner from '@/components/AlertBanner.vue';
import AppButton from '@/components/AppButton.vue';
import AppTextField from '@/components/AppTextField.vue';
import MemberStatusEditor from '@/components/MemberStatusEditor.vue';
import NameListEditor from '@/components/NameListEditor.vue';
import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import type { GroupFormErrors } from '@/utils/groupFormValidation';
import type { MemberStatusDraft } from '@/types/MemberStatusDraft';
import type { MemberStatusInterface } from '@/interfaces/MemberStatusInterface';
import type { NameDraft } from '@/types/NameDraft';
import { CommitteeService } from '@/services/CommitteeService';
import { GroupService } from '@/services/GroupService';
import { MemberStatusService } from '@/services/MemberStatusService';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { ToastService } from '@/services/ToastService';
import { hasFormErrors, validateGroupBasics } from '@/utils/groupFormValidation';
import { resolveErrorMessage } from '@/utils/resolveErrorMessage';

/* Types */
interface GroupEditForm {
  name: string;
  committees: NameDraft[];
  statuses: MemberStatusDraft[];
}

/* Variables */
const route = useRoute();
const router = useRouter();

/* Reactive Variables */
const form = reactive<GroupEditForm>({
  name: '',
  committees: [{ id: null, name: '' }],
  statuses: [{ id: null, name: '', percentage: 0 }],
});
const errors = ref<GroupFormErrors>({});
const formError = ref<string>('');
const isLoading = ref<boolean>(true);
const isSubmitting = ref<boolean>(false);
const groupExists = ref<boolean>(false);

/* Selectors */
const groupId = computed<number>(() => Number(route.params.id));

/* Functions */
function toCommitteeDrafts(items: CommitteeInterface[]): NameDraft[] {
  const drafts = items.map((item: CommitteeInterface) => ({ id: item.id, name: item.name }));
  return drafts.length > 0 ? drafts : [{ id: null, name: '' }];
}

function toStatusDrafts(items: MemberStatusInterface[]): MemberStatusDraft[] {
  const drafts = items.map((item: MemberStatusInterface) => ({
    id: item.id,
    name: item.name,
    percentage: item.target,
  }));
  return drafts.length > 0 ? drafts : [{ id: null, name: '', percentage: 0 }];
}

async function loadGroup(): Promise<void> {
  isLoading.value = true;
  try {
    const [group, committees, statuses] = await Promise.all([
      GroupService.getGroupById(groupId.value),
      CommitteeService.getCommitteesByGroupId(groupId.value),
      MemberStatusService.getMemberStatusesByGroupId(groupId.value),
    ]);

    if (group === null) {
      groupExists.value = false;
      return;
    }

    groupExists.value = true;
    form.name = group.name;
    form.committees = toCommitteeDrafts(committees);
    form.statuses = toStatusDrafts(statuses);
  } catch (error: unknown) {
    ToastService.error(resolveErrorMessage(error));
  } finally {
    isLoading.value = false;
  }
}

async function handleSubmit(): Promise<void> {
  formError.value = '';

  errors.value = validateGroupBasics(
    form.name,
    form.committees.map((draft: NameDraft) => draft.name),
    form.statuses,
  );
  if (hasFormErrors(errors.value)) {
    return;
  }

  isSubmitting.value = true;
  try {
    await GroupService.updateGroupDetails(groupId.value, {
      name: form.name,
      committees: form.committees,
      statuses: form.statuses,
    });
    ToastService.success('Cambios del grupo guardados.');
    void router.push({
      name: ROUTE_NAMES.ADMIN_GROUP_DETAIL,
      params: { id: String(groupId.value) },
    });
  } catch (error: unknown) {
    formError.value = resolveErrorMessage(error);
    ToastService.error(formError.value);
  } finally {
    isSubmitting.value = false;
  }
}

function goBack(): void {
  void router.push({ name: ROUTE_NAMES.ADMIN_GROUP_DETAIL, params: { id: String(groupId.value) } });
}

function goToGroups(): void {
  void router.push({ name: ROUTE_NAMES.ADMIN_GROUPS });
}

onMounted(() => {
  void loadGroup();
});
</script>

<template>
  <section class="mx-auto max-w-3xl space-y-6">
    <button
      type="button"
      class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-700"
      @click="goBack"
    >
      <i class="fa-solid fa-arrow-left" />
      Volver al detalle
    </button>

    <p v-if="isLoading" class="text-sm text-slate-500">Cargando grupo…</p>

    <div
      v-else-if="!groupExists"
      class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"
    >
      <p class="text-sm text-slate-500">El grupo solicitado no existe.</p>
      <AppButton class="mt-4" variant="secondary" @click="goToGroups"> Volver a grupos </AppButton>
    </div>

    <div v-else class="rounded-2xl border border-slate-200 bg-white p-8">
      <h2 class="text-xl font-bold text-ink">Editar grupo estudiantil</h2>
      <p class="mt-1 text-sm text-slate-500">
        Actualiza el nombre del grupo y gestiona sus comités/departamentos y los estados de miembro
        con su porcentaje de permanencia.
      </p>

      <form class="mt-6 space-y-8" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <AppTextField
            id="group-name"
            v-model="form.name"
            label="Nombre del grupo"
            placeholder="Ej: Semillero de Robótica"
            :error="errors.name"
            required
          />
          <NameListEditor
            v-model="form.committees"
            label="Comités / Departamentos"
            add-label="Agregar comité"
            placeholder="Ej: Comité de Comunicaciones"
            :error="errors.committees"
          />
          <MemberStatusEditor v-model="form.statuses" :error="errors.statuses" />
        </div>

        <AlertBanner v-if="formError" type="error" :message="formError" />

        <div class="flex justify-end gap-3">
          <AppButton variant="ghost" type="button" @click="goBack">Cancelar</AppButton>
          <AppButton type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Guardando…' : 'Guardar cambios' }}
          </AppButton>
        </div>
      </form>
    </div>
  </section>
</template>
