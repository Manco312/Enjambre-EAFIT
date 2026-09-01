<script setup lang="ts">
/* External Imports */
import { storeToRefs } from 'pinia';

/* Internal Imports */
import type { ToastKind } from '@/types/Toast';
import { ToastService } from '@/services/ToastService';
import { useToastStore } from '@/stores/toaststore';

/* Selectors */
const { toasts } = storeToRefs(useToastStore());

/* Functions */
function iconClass(kind: ToastKind): string {
  switch (kind) {
    case 'success':
      return 'fa-circle-check';
    case 'error':
      return 'fa-circle-exclamation';
    default:
      return 'fa-circle-info';
  }
}

function accentClass(kind: ToastKind): string {
  switch (kind) {
    case 'success':
      return 'border-emerald-200 text-emerald-600';
    case 'error':
      return 'border-red-200 text-red-600';
    default:
      return 'border-brand-200 text-brand-600';
  }
}

function dismiss(id: number): void {
  ToastService.dismiss(id);
}
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-x-4 opacity-0"
        leave-active-class="absolute w-[inherit] transition duration-200 ease-in"
        leave-to-class="translate-x-4 opacity-0"
        move-class="transition duration-200"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 rounded-lg border bg-white px-4 py-3 text-sm shadow-lg"
          :class="accentClass(toast.kind)"
          role="status"
        >
          <i class="fa-solid mt-0.5" :class="iconClass(toast.kind)" />
          <p class="flex-1 text-slate-700">{{ toast.message }}</p>
          <button
            type="button"
            class="text-slate-400 transition hover:text-slate-600"
            aria-label="Cerrar notificación"
            @click="dismiss(toast.id)"
          >
            <i class="fa-solid fa-xmark text-xs" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
