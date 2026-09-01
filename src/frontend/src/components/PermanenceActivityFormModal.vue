<script setup lang="ts">
/* External Imports */
import { computed, reactive, ref, watch } from 'vue';

/* Internal Imports */
import AlertBanner from '@/components/AlertBanner.vue';
import AppButton from '@/components/AppButton.vue';
import AppTextField from '@/components/AppTextField.vue';
import type { Nullable } from '@/types/Nullable';
import type { PermanenceActivityInterface } from '@/interfaces/PermanenceActivityInterface';

/* Types */
export interface PermanenceActivityFormPayload {
  name: string;
  description: string;
  weight: number;
  period: string;
}

interface PermanenceActivityFormErrors {
  name?: string;
  weight?: string;
}

/* Props */
const props = defineProps<{
  open: boolean;
  sheetLabel: string;
  activity: Nullable<PermanenceActivityInterface>;
}>();

/* Emits */
const emit = defineEmits<{ submit: [payload: PermanenceActivityFormPayload]; close: [] }>();

/* Reactive Variables */
const form = reactive<PermanenceActivityFormPayload>({
  name: '',
  description: '',
  weight: 0,
  period: '',
});
const errors = ref<PermanenceActivityFormErrors>({});

/* Selectors */
const isEditing = computed<boolean>(() => props.activity !== null);

/* Watchers */
watch(
  () => props.open,
  (open: boolean): void => {
    if (!open) {
      return;
    }
    errors.value = {};
    if (props.activity !== null) {
      form.name = props.activity.name;
      form.description = props.activity.description;
      form.weight = props.activity.weight;
      form.period = props.activity.period;
    } else {
      form.name = '';
      form.description = '';
      form.weight = 0;
      form.period = '';
    }
  },
);

/* Functions */
function onWeightInput(event: Event): void {
  form.weight = Number((event.target as HTMLInputElement).value);
}

function validate(): boolean {
  const next: PermanenceActivityFormErrors = {};
  if (form.name.trim().length < 3) {
    next.name = 'El nombre debe tener al menos 3 caracteres.';
  }
  if (Number.isNaN(form.weight) || form.weight < 0 || form.weight > 100) {
    next.weight = 'El peso debe estar entre 0 y 100.';
  }
  errors.value = next;
  return Object.keys(next).length === 0;
}

function handleSubmit(): void {
  if (!validate()) {
    return;
  }
  emit('submit', {
    name: form.name,
    description: form.description,
    weight: form.weight,
    period: form.period,
  });
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
        class="relative my-8 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-bold text-ink">
              {{ isEditing ? 'Editar actividad' : 'Agregar actividad' }}
            </h2>
            <p class="mt-1 text-sm text-slate-500">Hoja: {{ sheetLabel }}</p>
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
          <AppTextField
            id="activity-name"
            v-model="form.name"
            label="Nombre de la actividad"
            placeholder="Ej: Asambleas generales"
            :error="errors.name"
            required
          />

          <div class="space-y-1.5">
            <label for="activity-description" class="block text-sm font-semibold text-slate-700">
              Descripción
            </label>
            <textarea
              id="activity-description"
              v-model="form.description"
              rows="3"
              placeholder="¿Qué debe cumplir el integrante en esta actividad?"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label for="activity-weight" class="block text-sm font-semibold text-slate-700">
                Peso (%) <span class="text-red-500">*</span>
              </label>
              <input
                id="activity-weight"
                :value="form.weight"
                type="number"
                min="0"
                max="100"
                class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                :class="errors.weight ? 'border-red-400' : 'border-slate-300'"
                @input="onWeightInput"
              />
              <p v-if="errors.weight" class="text-xs font-medium text-red-500">
                {{ errors.weight }}
              </p>
            </div>
            <AppTextField
              id="activity-period"
              v-model="form.period"
              label="Periodo"
              placeholder="Ej: 2026-1"
            />
          </div>

          <AlertBanner
            type="info"
            message="El peso de todas las actividades de una hoja debería sumar 100%."
          />

          <div class="flex justify-end gap-3 pt-2">
            <AppButton variant="ghost" type="button" @click="handleClose">Cancelar</AppButton>
            <AppButton type="submit">{{ isEditing ? 'Guardar' : 'Agregar actividad' }}</AppButton>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
