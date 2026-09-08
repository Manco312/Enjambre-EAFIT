<script setup lang="ts" generic="T extends string">
/* External Imports */
import { nextTick, onBeforeUnmount, ref } from 'vue';

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
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelStyle = ref<Record<string, string>>({});

const PANEL_MAX_HEIGHT = 224; // coincide con max-h-56

/* Functions */
function updatePosition(): void {
  const trigger = triggerRef.value;
  if (trigger === null) {
    return;
  }

  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = props.openUp || (spaceBelow < PANEL_MAX_HEIGHT && rect.top > spaceBelow);
  const width = Math.max(rect.width, 208);

  panelStyle.value = {
    position: 'fixed',
    left: `${Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))}px`,
    width: `${width}px`,
    ...(openUpward
      ? { bottom: `${window.innerHeight - rect.top + 4}px` }
      : { top: `${rect.bottom + 4}px` }),
  };
}

async function open(): Promise<void> {
  isOpen.value = true;
  await nextTick();
  updatePosition();
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('resize', updatePosition);
}

function close(): void {
  if (!isOpen.value) {
    return;
  }
  isOpen.value = false;
  window.removeEventListener('scroll', updatePosition, true);
  window.removeEventListener('resize', updatePosition);
}

function toggleOpen(): void {
  if (isOpen.value) {
    close();
  } else {
    void open();
  }
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

onBeforeUnmount(close);
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-semibold text-slate-700">{{ label }}</label>

    <button
      ref="triggerRef"
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

    <p v-if="error" class="text-xs font-medium text-red-500">{{ error }}</p>
  </div>

  <Teleport to="body">
    <template v-if="isOpen">
      <div class="fixed inset-0 z-[60]" @click="close" />
      <div
        class="z-[70] max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
        :style="panelStyle"
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
    </template>
  </Teleport>
</template>
