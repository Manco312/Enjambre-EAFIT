<script setup lang="ts">
/* Types */
type FieldType = 'text' | 'password' | 'email' | 'number';

/* Props */
withDefaults(
  defineProps<{
    id: string;
    label: string;
    modelValue: string;
    type?: FieldType;
    placeholder?: string;
    required?: boolean;
    autocomplete?: string;
    error?: string;
    hint?: string;
  }>(),
  {
    type: 'text',
    placeholder: '',
    required: false,
    autocomplete: 'off',
    error: '',
    hint: '',
  },
);

/* Emits */
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

/* Functions */
function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}
</script>

<template>
  <div class="space-y-1.5">
    <label :for="id" class="block text-sm font-semibold text-slate-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
      class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      :class="error ? 'border-red-400' : 'border-slate-300'"
      @input="handleInput"
    />
    <p v-if="error" class="text-xs font-medium text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-slate-400">{{ hint }}</p>
  </div>
</template>
