<script setup lang="ts">
/* External Imports */
import { reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

/* Internal Imports */
import AlertBanner from '@/components/AlertBanner.vue';
import AppButton from '@/components/AppButton.vue';
import AppTextField from '@/components/AppTextField.vue';
import MemberStatusEditor from '@/components/MemberStatusEditor.vue';
import NameListEditor from '@/components/NameListEditor.vue';
import type { MemberStatusDraft } from '@/types/MemberStatusDraft';
import type { NameDraft } from '@/types/NameDraft';
import type { RegisterGroupFormErrors } from '@/utils/groupFormValidation';
import { DEFAULT_MEMBER_STATUSES } from '@/constants/membershipStatuses';
import { GroupService } from '@/services/GroupService';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { ToastService } from '@/services/ToastService';
import { hasFormErrors, validateRegisterGroupForm } from '@/utils/groupFormValidation';
import { resolveErrorMessage } from '@/utils/resolveErrorMessage';
import { slugify } from '@/utils/slugify';

/* Types */
interface GroupCreateForm {
  name: string;
  committees: NameDraft[];
  statuses: MemberStatusDraft[];
  boardUsername: string;
  boardPassword: string;
  boardPasswordConfirmation: string;
}

/* Variables */
const router = useRouter();

/* Reactive Variables */
const form = reactive<GroupCreateForm>({
  name: '',
  committees: [{ id: null, name: '' }],
  statuses: DEFAULT_MEMBER_STATUSES.map((status) => ({
    id: null,
    name: status.name,
    percentage: status.percentage,
  })),
  boardUsername: '',
  boardPassword: '',
  boardPasswordConfirmation: '',
});
const errors = ref<RegisterGroupFormErrors>({});
const formError = ref<string>('');
const lastSuggestedUsername = ref<string>('');

/* Watchers */
watch(
  () => form.name,
  (name: string): void => {
    const suggestion = slugify(name);
    if (form.boardUsername === '' || form.boardUsername === lastSuggestedUsername.value) {
      form.boardUsername = suggestion;
    }
    lastSuggestedUsername.value = suggestion;
  },
);

/* Functions */
function handleSubmit(): void {
  formError.value = '';

  const payload = {
    name: form.name,
    committeeNames: form.committees.map((draft: NameDraft) => draft.name),
    statuses: form.statuses.map((draft: MemberStatusDraft) => ({
      name: draft.name,
      percentage: draft.percentage,
    })),
    boardUsername: form.boardUsername,
    boardPassword: form.boardPassword,
  };

  errors.value = validateRegisterGroupForm(payload, form.statuses, form.boardPasswordConfirmation);
  if (hasFormErrors(errors.value)) {
    return;
  }

  try {
    const group = GroupService.registerGroup(payload);
    ToastService.success(`Grupo «${group.name}» creado correctamente.`);
    void router.push({ name: ROUTE_NAMES.ADMIN_GROUP_DETAIL, params: { id: String(group.id) } });
  } catch (error: unknown) {
    formError.value = resolveErrorMessage(error);
    ToastService.error(formError.value);
  }
}

function goBack(): void {
  void router.push({ name: ROUTE_NAMES.ADMIN_GROUPS });
}
</script>

<template>
  <section class="mx-auto max-w-3xl space-y-6">
    <button
      type="button"
      class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-700"
      @click="goBack"
    >
      <i class="fa-solid fa-arrow-left" />
      Volver a grupos
    </button>

    <div class="rounded-2xl border border-slate-200 bg-white p-8">
      <h2 class="text-xl font-bold text-ink">Crear grupo estudiantil</h2>
      <p class="mt-1 text-sm text-slate-500">
        Registra el grupo, sus comités o departamentos, los estados de miembro con su porcentaje de
        permanencia y la cuenta de su junta directiva.
      </p>

      <form class="mt-6 space-y-8" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <h3 class="text-sm font-bold tracking-wide text-slate-400 uppercase">Datos del grupo</h3>
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

        <div class="space-y-4 border-t border-slate-100 pt-6">
          <h3 class="text-sm font-bold tracking-wide text-slate-400 uppercase">
            Cuenta de la junta directiva
          </h3>
          <AppTextField
            id="board-username"
            v-model="form.boardUsername"
            label="Usuario"
            placeholder="junta.robotica"
            hint="Se sugiere a partir del nombre del grupo. Puedes editarlo."
            :error="errors.boardUsername"
            required
          />
          <div class="grid gap-4 sm:grid-cols-2">
            <AppTextField
              id="board-password"
              v-model="form.boardPassword"
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              :error="errors.boardPassword"
              required
            />
            <AppTextField
              id="board-password-confirmation"
              v-model="form.boardPasswordConfirmation"
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite la contraseña"
              :error="errors.boardPasswordConfirmation"
              required
            />
          </div>
        </div>

        <AlertBanner v-if="formError" type="error" :message="formError" />

        <div class="flex justify-end gap-3">
          <AppButton variant="ghost" type="button" @click="goBack">Cancelar</AppButton>
          <AppButton type="submit">Crear grupo</AppButton>
        </div>
      </form>
    </div>
  </section>
</template>
