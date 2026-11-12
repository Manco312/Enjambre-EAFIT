<script setup lang="ts">
/* Internal Imports */
import AppButton from '@/components/AppButton.vue';
import type { MemberStatusDraft } from '@/types/MemberStatusDraft';
import { LIMITS } from '@/constants/limits';

/* Props */
const props = withDefaults(defineProps<{ modelValue: MemberStatusDraft[]; error?: string }>(), {
  error: '',
});

/* Emits */
const emit = defineEmits<{ 'update:modelValue': [value: MemberStatusDraft[]] }>();

/* Functions */
function patch(index: number, patchValue: Partial<MemberStatusDraft>): void {
  const next = props.modelValue.map((draft: MemberStatusDraft, draftIndex: number) =>
    draftIndex === index ? { ...draft, ...patchValue } : draft,
  );
  emit('update:modelValue', next);
}

function onNameInput(index: number, event: Event): void {
  patch(index, { name: (event.target as HTMLInputElement).value });
}

// Un campo vacío es NaN ("sin porcentaje"), nunca 0: así un porcentaje borrado
// no se guarda como 0 por accidente y la validación puede pedirlo.
function onPercentageInput(index: number, event: Event): void {
  const raw = (event.target as HTMLInputElement).value.trim();
  patch(index, { percentage: raw === '' ? Number.NaN : Number(raw) });
}

function percentageText(draft: MemberStatusDraft): string {
  return Number.isNaN(draft.percentage) ? '' : String(draft.percentage);
}

function addItem(): void {
  emit('update:modelValue', [...props.modelValue, { id: null, name: '', percentage: Number.NaN }]);
}

function removeItem(index: number): void {
  const next = props.modelValue.filter(
    (_draft: MemberStatusDraft, draftIndex: number) => draftIndex !== index,
  );
  emit(
    'update:modelValue',
    next.length > 0 ? next : [{ id: null, name: '', percentage: Number.NaN }],
  );
}
</script>

<template>
  <div class="space-y-2">
    <div>
      <label class="block text-sm font-semibold text-slate-700">
        Estados de miembro y % de permanencia <span class="text-red-500">*</span>
      </label>
      <p class="text-xs text-slate-400">
        Cada estado define el porcentaje de la tabla de permanencia que sus miembros deben cumplir
        (número entero de 0 a {{ LIMITS.MAX_PERCENTAGE }}).
      </p>
    </div>

    <div class="flex items-center gap-2 px-1 text-xs font-semibold text-slate-400">
      <span class="flex-1">Estado</span>
      <span class="w-28 text-right">Objetivo %</span>
      <span class="w-10"></span>
    </div>

    <div v-for="(draft, index) in modelValue" :key="index" class="flex items-center gap-2">
      <input
        :value="draft.name"
        type="text"
        placeholder="Ej: ACTIVO"
        :maxlength="LIMITS.NAME_MAX_LENGTH"
        class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        @input="onNameInput(index, $event)"
      />
      <input
        :value="percentageText(draft)"
        type="number"
        min="0"
        :max="LIMITS.MAX_PERCENTAGE"
        step="1"
        placeholder="%"
        class="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-right text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        @input="onPercentageInput(index, $event)"
      />
      <button
        type="button"
        class="w-10 shrink-0 rounded-lg border border-slate-200 py-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="modelValue.length === 1"
        @click="removeItem(index)"
      >
        <i class="fa-solid fa-trash" />
      </button>
    </div>

    <p v-if="error" class="text-xs font-medium text-red-500">{{ error }}</p>

    <AppButton variant="secondary" type="button" @click="addItem">
      <i class="fa-solid fa-plus" />
      Agregar estado
    </AppButton>
  </div>
</template>
