<script setup lang="ts">
/* External Imports */
import { computed } from 'vue';

/* Types */
type AlertType = 'error' | 'success' | 'info';

/* Props */
const props = withDefaults(defineProps<{ type?: AlertType; message: string }>(), { type: 'info' });

/* Selectors */
const containerClasses = computed<string>(() => {
  switch (props.type) {
    case 'error':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    default:
      return 'border-brand-200 bg-brand-50 text-brand-700';
  }
});

const iconClass = computed<string>(() => {
  switch (props.type) {
    case 'error':
      return 'fa-circle-exclamation';
    case 'success':
      return 'fa-circle-check';
    default:
      return 'fa-circle-info';
  }
});
</script>

<template>
  <div class="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm" :class="containerClasses">
    <i class="fa-solid mt-0.5" :class="iconClass" />
    <p>{{ message }}</p>
  </div>
</template>
