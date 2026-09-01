<script setup lang="ts">
/* External Imports */
import { computed } from 'vue';

/* Internal Imports */
import { ENVIRONMENT } from '@/constants/environment';

/* Types */
type BrandTone = 'light' | 'dark';

/* Props */
const props = withDefaults(defineProps<{ tone?: BrandTone; showInstitution?: boolean }>(), {
  tone: 'dark',
  showInstitution: true,
});

/* Selectors */
const titleClass = computed<string>(() => (props.tone === 'light' ? 'text-white' : 'text-ink'));
const institutionClass = computed<string>(() =>
  props.tone === 'light' ? 'text-brand-200' : 'text-slate-500',
);
</script>

<template>
  <div class="flex items-center gap-3">
    <span
      class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-lg font-black text-white"
    >
      E
    </span>
    <div class="leading-tight">
      <p class="text-sm font-bold tracking-wide uppercase" :class="titleClass">
        {{ ENVIRONMENT.APP_NAME }}
      </p>
      <p v-if="showInstitution" class="text-xs" :class="institutionClass">
        {{ ENVIRONMENT.APP_INSTITUTION }}
      </p>
    </div>
  </div>
</template>
