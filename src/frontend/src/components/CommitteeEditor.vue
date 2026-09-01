<script setup lang="ts">
/* Internal Imports */
import AppButton from '@/components/AppButton.vue';
import type { CommitteeDraft } from '@/types/CommitteeDraft';

/* Props */
const props = defineProps<{ modelValue: CommitteeDraft[]; error?: string }>();

/* Emits */
const emit = defineEmits<{ 'update:modelValue': [value: CommitteeDraft[]] }>();

/* Functions */
function updateName(index: number, value: string): void {
  const next = props.modelValue.map((draft: CommitteeDraft, draftIndex: number) =>
    draftIndex === index ? { ...draft, name: value } : draft,
  );
  emit('update:modelValue', next);
}

function handleInput(index: number, event: Event): void {
  const target = event.target as HTMLInputElement;
  updateName(index, target.value);
}

function addItem(): void {
  emit('update:modelValue', [...props.modelValue, { id: null, name: '' }]);
}

function removeItem(index: number): void {
  const next = props.modelValue.filter(
    (_draft: CommitteeDraft, draftIndex: number) => draftIndex !== index,
  );
  emit('update:modelValue', next.length > 0 ? next : [{ id: null, name: '' }]);
}
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-semibold text-slate-700">
      Comités / Departamentos <span class="text-red-500">*</span>
    </label>

    <div v-for="(draft, index) in modelValue" :key="index" class="flex items-center gap-2">
      <input
        :value="draft.name"
        type="text"
        placeholder="Ej: Comité de Comunicaciones"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        @input="handleInput(index, $event)"
      />
      <button
        type="button"
        class="shrink-0 rounded-lg border border-slate-200 px-3 py-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="modelValue.length === 1"
        @click="removeItem(index)"
      >
        <i class="fa-solid fa-trash" />
      </button>
    </div>

    <p v-if="error" class="text-xs font-medium text-red-500">{{ error }}</p>

    <AppButton variant="secondary" type="button" @click="addItem">
      <i class="fa-solid fa-plus" />
      Agregar comité
    </AppButton>
  </div>
</template>
