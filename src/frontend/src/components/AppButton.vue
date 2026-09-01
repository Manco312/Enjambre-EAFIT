<script setup lang="ts">
/* External Imports */
import { computed } from 'vue';

/* Types */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonType = 'button' | 'submit';

/* Props */
const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    type?: ButtonType;
    disabled?: boolean;
    block?: boolean;
  }>(),
  { variant: 'primary', type: 'button', disabled: false, block: false },
);

/* Emits */
const emit = defineEmits<{ click: [event: MouseEvent] }>();

/* Selectors */
const variantClasses = computed<string>(() => {
  switch (props.variant) {
    case 'secondary':
      return 'border border-brand-200 bg-white text-brand-700 hover:bg-brand-50';
    case 'ghost':
      return 'bg-transparent text-slate-600 hover:bg-slate-100';
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700';
    default:
      return 'bg-brand-600 text-white hover:bg-brand-700';
  }
});

/* Functions */
function handleClick(event: MouseEvent): void {
  if (props.disabled) {
    return;
  }
  emit('click', event);
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
    :class="[variantClasses, block ? 'w-full' : '']"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
