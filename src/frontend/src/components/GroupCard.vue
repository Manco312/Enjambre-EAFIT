<script setup lang="ts">
/* Internal Imports */
import type { GroupInterface } from '@/interfaces/GroupInterface';

/* Props */
const props = defineProps<{
  group: GroupInterface;
  committeeCount: number;
  boardUsername: string;
}>();

/* Emits */
const emit = defineEmits<{
  select: [groupId: number];
  edit: [groupId: number];
  delete: [groupId: number];
}>();

/* Functions */
function handleSelect(): void {
  emit('select', props.group.id);
}

function handleEdit(): void {
  emit('edit', props.group.id);
}

function handleDelete(): void {
  emit('delete', props.group.id);
}
</script>

<template>
  <article
    class="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
  >
    <div class="flex items-start justify-between gap-3">
      <h3 class="text-base font-bold text-ink">{{ group.name }}</h3>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-brand-700"
          title="Editar grupo"
          @click="handleEdit"
        >
          <i class="fa-solid fa-pen text-xs" />
        </button>
        <button
          type="button"
          class="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          title="Eliminar grupo"
          @click="handleDelete"
        >
          <i class="fa-solid fa-trash text-xs" />
        </button>
      </div>
    </div>

    <dl class="mt-4 space-y-1.5 text-sm text-slate-500">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-sitemap w-4 text-center text-slate-400" />
        <span>{{ committeeCount }} comité(s) / departamento(s)</span>
      </div>
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-user-shield w-4 text-center text-slate-400" />
        <span>Junta: {{ boardUsername || 'sin cuenta' }}</span>
      </div>
    </dl>

    <button
      type="button"
      class="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
      @click="handleSelect"
    >
      Ver detalle
      <i class="fa-solid fa-arrow-right" />
    </button>
  </article>
</template>
