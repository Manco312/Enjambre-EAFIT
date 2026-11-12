<script setup lang="ts">
/* External Imports */
import { computed, reactive, ref, watch } from 'vue';

/* Internal Imports */
import AlertBanner from '@/components/AlertBanner.vue';
import AppButton from '@/components/AppButton.vue';
import AppTextField from '@/components/AppTextField.vue';
import type { ActivityInterface } from '@/interfaces/ActivityInterface';
import type { Nullable } from '@/types/Nullable';
import { LIMITS } from '@/constants/limits';

/* Types */
export interface ActivityFormPayload {
  name: string;
  description: string;
  weight: number;
}

interface ActivityFormErrors {
  name?: string;
  description?: string;
  weight?: string;
}

/* Props */
const props = defineProps<{
  open: boolean;
  sheetLabel: string;
  activity: Nullable<ActivityInterface>;
  // Porcentaje que aún se puede asignar en la hoja (100 menos el peso de las
  // demás actividades). Los pesos de una hoja no pueden sumar más de 100.
  availableWeight: number;
}>();

/* Emits */
const emit = defineEmits<{ submit: [payload: ActivityFormPayload]; close: [] }>();

/* Reactive Variables */
// `weight` es NaN mientras el campo está vacío: un peso sin escribir no se
// convierte en 0.
const form = reactive<ActivityFormPayload>({
  name: '',
  description: '',
  weight: Number.NaN,
});
const errors = ref<ActivityFormErrors>({});

/* Selectors */
const isEditing = computed<boolean>(() => props.activity !== null);

const weightText = computed<string>(() => (Number.isNaN(form.weight) ? '' : String(form.weight)));

const weightHint = computed<string>(() =>
  props.availableWeight <= 0
    ? `Esta hoja ya tiene asignado el ${LIMITS.MAX_PERCENTAGE}%. Baja el peso de otra actividad para liberar espacio.`
    : `Los pesos de una hoja pueden sumar como máximo ${LIMITS.MAX_PERCENTAGE}%. Disponible para esta actividad: ${props.availableWeight}%.`,
);

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
    } else {
      form.name = '';
      form.description = '';
      form.weight = Number.NaN;
    }
  },
);

/* Functions */
function onWeightInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value.trim();
  form.weight = raw === '' ? Number.NaN : Number(raw);
}

function validate(): boolean {
  const next: ActivityFormErrors = {};
  const name = form.name.trim();

  if (name.length < 3) {
    next.name = 'El nombre debe tener al menos 3 caracteres.';
  } else if (name.length > LIMITS.NAME_MAX_LENGTH) {
    next.name = `El nombre puede tener máximo ${LIMITS.NAME_MAX_LENGTH} caracteres.`;
  }

  if (form.description.trim().length > LIMITS.DESCRIPTION_MAX_LENGTH) {
    next.description = `La descripción puede tener máximo ${LIMITS.DESCRIPTION_MAX_LENGTH} caracteres.`;
  }

  if (Number.isNaN(form.weight)) {
    next.weight = 'El peso es obligatorio.';
  } else if (
    !Number.isInteger(form.weight) ||
    form.weight < 1 ||
    form.weight > LIMITS.MAX_PERCENTAGE
  ) {
    next.weight = `El peso debe ser un número entero entre 1 y ${LIMITS.MAX_PERCENTAGE}.`;
  } else if (form.weight > props.availableWeight) {
    next.weight =
      props.availableWeight <= 0
        ? 'La hoja ya no tiene porcentaje disponible.'
        : `Solo queda ${props.availableWeight}% disponible en esta hoja.`;
  }

  errors.value = next;
  return Object.keys(next).length === 0;
}

function handleSubmit(): void {
  if (!validate()) {
    return;
  }
  emit('submit', {
    name: form.name.trim(),
    description: form.description.trim(),
    weight: form.weight,
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

        <!-- `novalidate`: la validación (y sus mensajes) la hace el formulario. -->
        <form class="mt-5 space-y-4" novalidate @submit.prevent="handleSubmit">
          <AppTextField
            id="activity-name"
            v-model="form.name"
            label="Nombre de la actividad"
            placeholder="Ej: Asambleas generales"
            :maxlength="LIMITS.NAME_MAX_LENGTH"
            :error="errors.name"
            required
          />

          <div class="space-y-1.5">
            <label for="activity-description" class="block text-sm font-semibold text-slate-700">
              Descripción <span class="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="activity-description"
              v-model="form.description"
              rows="3"
              :maxlength="LIMITS.DESCRIPTION_MAX_LENGTH"
              placeholder="¿Qué debe cumplir el integrante en esta actividad?"
              class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              :class="errors.description ? 'border-red-400' : 'border-slate-300'"
            />
            <p v-if="errors.description" class="text-xs font-medium text-red-500">
              {{ errors.description }}
            </p>
          </div>

          <div class="space-y-1.5">
            <label for="activity-weight" class="block text-sm font-semibold text-slate-700">
              Peso (%) <span class="text-red-500">*</span>
            </label>
            <input
              id="activity-weight"
              :value="weightText"
              type="number"
              min="1"
              :max="LIMITS.MAX_PERCENTAGE"
              step="1"
              class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              :class="errors.weight ? 'border-red-400' : 'border-slate-300'"
              @input="onWeightInput"
            />
            <p v-if="errors.weight" class="text-xs font-medium text-red-500">
              {{ errors.weight }}
            </p>
          </div>

          <AlertBanner type="info" :message="weightHint" />

          <div class="flex justify-end gap-3 pt-2">
            <AppButton variant="ghost" type="button" @click="handleClose">Cancelar</AppButton>
            <AppButton type="submit">{{ isEditing ? 'Guardar' : 'Agregar actividad' }}</AppButton>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
