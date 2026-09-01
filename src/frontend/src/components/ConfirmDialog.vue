<script setup lang="ts">
/* External Imports */
import { computed } from 'vue';

/* Internal Imports */
import AppButton from '@/components/AppButton.vue';

/* Types */
type DialogTone = 'danger' | 'primary';

/* Props */
const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: DialogTone;
  }>(),
  { confirmLabel: 'Confirmar', cancelLabel: 'Cancelar', tone: 'primary' },
);

/* Emits */
const emit = defineEmits<{ confirm: []; cancel: [] }>();

/* Selectors */
const confirmVariant = computed<'primary' | 'danger'>(() =>
  props.tone === 'danger' ? 'danger' : 'primary',
);

/* Functions */
function handleConfirm(): void {
  emit('confirm');
}

function handleCancel(): void {
  emit('cancel');
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-ink/40" @click="handleCancel" />
      <div
        class="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <h2 class="text-lg font-bold text-ink">{{ title }}</h2>
        <p class="mt-2 text-sm text-slate-600">{{ message }}</p>
        <div class="mt-6 flex justify-end gap-3">
          <AppButton variant="ghost" @click="handleCancel">{{ cancelLabel }}</AppButton>
          <AppButton :variant="confirmVariant" @click="handleConfirm">{{ confirmLabel }}</AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
