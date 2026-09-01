<script setup lang="ts">
/* External Imports */
import { computed, reactive, ref } from 'vue';
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
import { PermanenceTargetService } from '@/services/PermanenceTargetService';
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

/* Selectors */
const groupId = computed<number>(() => Number(route.params.id));
const groupExists = computed<boolean>(() => GroupService.getGroupById(groupId.value) !== null);

/* Functions */
function toCommitteeDrafts(items: CommitteeInterface[]): NameDraft[] {
  const drafts = items.map((item: CommitteeInterface) => ({ id: item.id, name: item.name }));
  return drafts.length > 0 ? drafts : [{ id: null, name: '' }];
}

function toStatusDrafts(items: MemberStatusInterface[]): MemberStatusDraft[] {
  const drafts = items.map((item: MemberStatusInterface) => ({
    id: item.id,
    name: item.name,
    percentage: PermanenceTargetService.getTargetByMemberStatusId(item.id)?.percentage ?? 0,
  }));
  return drafts.length > 0 ? drafts : [{ id: null, name: '', percentage: 0 }];
}

function loadGroup(): void {
  const group = GroupService.getGroupById(groupId.value);
  if (group === null) {
    return;
  }

  form.name = group.name;
  form.committees = toCommitteeDrafts(CommitteeService.getCommitteesByGroupId(groupId.value));
  form.statuses = toStatusDrafts(MemberStatusService.getMemberStatusesByGroupId(groupId.value));
}

function handleSubmit(): void {
  formError.value = '';

  errors.value = validateGroupBasics(
    form.name,
    form.committees.map((draft: NameDraft) => draft.name),
    form.statuses,
  );
  if (hasFormErrors(errors.value)) {
    return;
  }

  try {
    GroupService.updateGroupDetails(groupId.value, {
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
  }
}

function goBack(): void {
  void router.push({ name: ROUTE_NAMES.ADMIN_GROUP_DETAIL, params: { id: String(groupId.value) } });
}

function goToGroups(): void {
  void router.push({ name: ROUTE_NAMES.ADMIN_GROUPS });
}

loadGroup();
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

    <div
      v-if="!groupExists"
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
          <AppButton type="submit">Guardar cambios</AppButton>
        </div>
      </form>
    </div>
  </section>
</template>
