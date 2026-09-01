<script setup lang="ts">
/* External Imports */
import { reactive, ref, watch } from 'vue';

/* Internal Imports */
import AlertBanner from '@/components/AlertBanner.vue';
import AppButton from '@/components/AppButton.vue';
import AppTextField from '@/components/AppTextField.vue';
import MultiSelect from '@/components/MultiSelect.vue';
import type { CreateMemberDTO } from '@/dtos/CreateMemberDTO';
import type { MemberFormErrors } from '@/utils/memberFormValidation';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_OPTIONS } from '@/constants/documentTypes';
import { hasMemberFormErrors, validateMemberForm } from '@/utils/memberFormValidation';

/* Props */
const props = defineProps<{
  open: boolean;
  groupId: number;
  areaOptions: string[];
  statusOptions: string[];
}>();

/* Emits */
const emit = defineEmits<{ submit: [dto: CreateMemberDTO]; close: [] }>();

/* Reactive Variables */
const form = reactive<CreateMemberDTO>(buildEmptyForm(props.groupId));
const errors = ref<MemberFormErrors>({});
const lastAutoUppercase = ref<string>('');

/* Watchers */
watch(
  () => props.open,
  (open: boolean): void => {
    if (open) {
      resetForm();
    }
  },
);

watch(
  () => form.email,
  (email: string): void => {
    if (form.emailUppercase === '' || form.emailUppercase === lastAutoUppercase.value) {
      form.emailUppercase = email.toUpperCase();
    }
    lastAutoUppercase.value = email.toUpperCase();
  },
);

/* Functions */
function buildEmptyForm(groupId: number): CreateMemberDTO {
  return {
    groupId,
    email: '',
    name: '',
    epikId: '',
    fullName: '',
    documentType: DOCUMENT_TYPES.CC,
    documentNumber: '',
    emailUppercase: '',
    phone: '',
    program: '',
    secondProgram: '',
    membershipStatus: [],
    areas: [],
  };
}

function resetForm(): void {
  Object.assign(form, buildEmptyForm(props.groupId));
  errors.value = {};
  lastAutoUppercase.value = '';
}

function handleSubmit(): void {
  errors.value = validateMemberForm(form);
  if (hasMemberFormErrors(errors.value)) {
    return;
  }
  emit('submit', { ...form });
}

function handleClose(): void {
  emit('close');
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div class="absolute inset-0 bg-ink/40" @click="handleClose" />

      <div
        class="relative my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-bold text-ink">Agregar integrante</h2>
            <p class="mt-1 text-sm text-slate-500">Completa los datos del nuevo integrante.</p>
          </div>
          <button
            type="button"
            class="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
            @click="handleClose"
          >
            <i class="fa-solid fa-xmark" />
          </button>
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="handleSubmit">
          <div class="grid gap-4 sm:grid-cols-2">
            <AppTextField
              id="member-email"
              v-model="form.email"
              label="Correo electrónico"
              type="email"
              placeholder="usuario@eafit.edu.co"
              :error="errors.email"
              required
            />
            <AppTextField
              id="member-email-upper"
              v-model="form.emailUppercase"
              label="Correo en mayúscula"
              placeholder="USUARIO@EAFIT.EDU.CO"
            />
            <AppTextField
              id="member-name"
              v-model="form.name"
              label="Nombre"
              :error="errors.name"
              required
            />
            <AppTextField
              id="member-full-name"
              v-model="form.fullName"
              label="Nombre completo en mayúscula"
              :error="errors.fullName"
              required
            />
            <AppTextField
              id="member-epik"
              v-model="form.epikId"
              label="ID EPIK"
              :error="errors.epikId"
              required
            />
            <div class="space-y-1.5">
              <label for="member-doc-type" class="block text-sm font-semibold text-slate-700">
                Tipo de documento <span class="text-red-500">*</span>
              </label>
              <select
                id="member-doc-type"
                v-model="form.documentType"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option v-for="option in DOCUMENT_TYPE_OPTIONS" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
            <AppTextField
              id="member-doc-number"
              v-model="form.documentNumber"
              label="Número de documento"
              :error="errors.documentNumber"
              required
            />
            <AppTextField
              id="member-phone"
              v-model="form.phone"
              label="Celular"
              :error="errors.phone"
            />
            <AppTextField
              id="member-program"
              v-model="form.program"
              label="Programa"
              placeholder="INGENIERÍA FÍSICA"
              :error="errors.program"
              required
            />
            <AppTextField
              id="member-second-program"
              v-model="form.secondProgram"
              label="Programa #2"
            />
          </div>

          <MultiSelect
            v-model="form.membershipStatus"
            label="Estado en el grupo"
            :options="statusOptions"
            :error="errors.membershipStatus"
          />
          <MultiSelect
            v-model="form.areas"
            label="Área a la que pertenece"
            :options="areaOptions"
            placeholder="Selecciona uno o más comités"
          />

          <AlertBanner
            v-if="hasMemberFormErrors(errors)"
            type="error"
            message="Revisa los campos marcados en rojo."
          />

          <div class="flex justify-end gap-3 pt-2">
            <AppButton variant="ghost" type="button" @click="handleClose">Cancelar</AppButton>
            <AppButton type="submit">Agregar integrante</AppButton>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
