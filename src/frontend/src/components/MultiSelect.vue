<script setup lang="ts" generic="T extends string">
/* External Imports */
import { ref } from 'vue';

/* Props */
const props = withDefaults(
  defineProps<{
    modelValue: T[];
    options: readonly T[];
    label?: string;
    placeholder?: string;
    error?: string;
    compact?: boolean;
    openUp?: boolean;
  }>(),
  { label: '', placeholder: 'Seleccionar…', error: '', compact: false, openUp: false },
);

/* Emits */
const emit = defineEmits<{ 'update:modelValue': [value: T[]] }>();

/* Reactive Variables */
const isOpen = ref<boolean>(false);

/* Functions */
function toggleOpen(): void {
  isOpen.value = !isOpen.value;
}

function close(): void {
  isOpen.value = false;
}

function isSelected(option: T): boolean {
  return props.modelValue.includes(option);
}

function toggleOption(option: T): void {
  const next = isSelected(option)
    ? props.modelValue.filter((item: T) => item !== option)
    : [...props.modelValue, option];
  emit('update:modelValue', next);
}
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-semibold text-slate-700">{{ label }}</label>

    <div class="relative">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-2 rounded-lg border bg-white text-left text-sm text-ink transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
        :class="[
          error ? 'border-red-400' : 'border-slate-300',
          compact ? 'px-2 py-1.5' : 'px-3 py-2.5',
        ]"
        @click="toggleOpen"
      >
        <span v-if="modelValue.length === 0" class="text-slate-400">{{ placeholder }}</span>
        <span v-else class="flex flex-wrap gap-1">
          <span
            v-for="value in modelValue"
            :key="value"
            class="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
          >
            {{ value }}
          </span>
        </span>
        <i class="fa-solid fa-chevron-down text-xs text-slate-400" />
      </button>

      <div v-if="isOpen" class="fixed inset-0 z-30" @click="close" />

      <div
        v-if="isOpen"
        class="absolute z-40 max-h-56 w-full min-w-52 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
        :class="openUp ? 'bottom-full mb-1' : 'mt-1'"
      >
        <p v-if="options.length === 0" class="px-2 py-1.5 text-xs text-slate-400">Sin opciones.</p>
        <label
          v-for="option in options"
          :key="option"
          class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-slate-50"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-brand-600"
            :checked="isSelected(option)"
            @change="toggleOption(option)"
          />
          <span>{{ option }}</span>
        </label>
      </div>
    </div>

    <p v-if="error" class="text-xs font-medium text-red-500">{{ error }}</p>
  </div>
</template>
