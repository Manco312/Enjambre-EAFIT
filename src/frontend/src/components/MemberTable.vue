<script setup lang="ts">
/* Internal Imports */
import MultiSelect from '@/components/MultiSelect.vue';
import type { DocumentType } from '@/types/DocumentType';
import type { MemberInterface } from '@/interfaces/MemberInterface';
import type { UpdateMemberDTO } from '@/dtos/UpdateMemberDTO';
import { DOCUMENT_TYPE_OPTIONS } from '@/constants/documentTypes';
import { MEMBER_COLUMNS } from '@/constants/memberColumns';
import { MemberService } from '@/services/MemberService';

/* Props */
const props = withDefaults(
  defineProps<{
    members: MemberInterface[];
    areaOptions: string[];
    statusOptions: string[];
    columnFilters: Partial<Record<keyof MemberInterface, string>>;
    readonly?: boolean;
  }>(),
  { readonly: false },
);

/* Emits */
const emit = defineEmits<{
  update: [id: number, dto: UpdateMemberDTO];
  delete: [id: number];
  filterChange: [key: keyof MemberInterface, value: string];
}>();

/* Functions */
function cellText(member: MemberInterface, key: keyof MemberInterface): string {
  return MemberService.fieldToText(member, key);
}

function filterValue(key: keyof MemberInterface): string {
  return props.columnFilters[key] ?? '';
}

function onFilterInput(key: keyof MemberInterface, event: Event): void {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  emit('filterChange', key, target.value);
}

function onTextInput(member: MemberInterface, key: keyof MemberInterface, event: Event): void {
  const target = event.target as HTMLInputElement;
  emit('update', member.id, { [key]: target.value } as UpdateMemberDTO);
}

function onDocumentTypeChange(member: MemberInterface, event: Event): void {
  const target = event.target as HTMLSelectElement;
  emit('update', member.id, { documentType: target.value as DocumentType });
}

function onStatusChange(member: MemberInterface, value: string[]): void {
  emit('update', member.id, { membershipStatus: value });
}

function onAreasChange(member: MemberInterface, value: string[]): void {
  emit('update', member.id, { areas: value });
}

function onDelete(member: MemberInterface): void {
  emit('delete', member.id);
}
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <table class="w-full min-w-[1500px] border-collapse text-sm">
      <thead>
        <tr class="bg-slate-50 text-left text-xs font-bold tracking-wide text-slate-500 uppercase">
          <th
            v-for="column in MEMBER_COLUMNS"
            :key="column.key"
            class="border-b border-slate-200 px-3 py-2.5 whitespace-nowrap"
          >
            {{ column.header }}
          </th>
          <th class="border-b border-slate-200 px-3 py-2.5 text-center">Acciones</th>
        </tr>
        <tr class="bg-white">
          <th
            v-for="column in MEMBER_COLUMNS"
            :key="column.key"
            class="border-b border-slate-200 p-1.5"
          >
            <select
              v-if="column.kind === 'documentType'"
              class="w-full rounded-md border border-slate-200 px-2 py-1 text-xs font-normal text-slate-600 outline-none focus:border-brand-500"
              :value="filterValue(column.key)"
              @change="onFilterInput(column.key, $event)"
            >
              <option value="">Todos</option>
              <option v-for="option in DOCUMENT_TYPE_OPTIONS" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            <input
              v-else
              type="text"
              placeholder="Filtrar…"
              class="w-full rounded-md border border-slate-200 px-2 py-1 text-xs font-normal text-slate-600 outline-none focus:border-brand-500"
              :value="filterValue(column.key)"
              @input="onFilterInput(column.key, $event)"
            />
          </th>
          <th class="border-b border-slate-200 p-1.5" />
        </tr>
      </thead>

      <tbody>
        <tr v-if="members.length === 0">
          <td :colspan="MEMBER_COLUMNS.length + 1" class="px-3 py-10 text-center text-slate-400">
            No hay integrantes que coincidan con los filtros.
          </td>
        </tr>

        <tr
          v-for="(member, rowIndex) in members"
          :key="member.id"
          class="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
        >
          <td v-for="column in MEMBER_COLUMNS" :key="column.key" class="px-2 py-1.5 align-top">
            <template v-if="readonly">
              <span class="block px-1 py-1 text-slate-700">{{ cellText(member, column.key) }}</span>
            </template>

            <MultiSelect
              v-else-if="column.kind === 'membershipStatus'"
              compact
              :open-up="rowIndex >= members.length - 4 && members.length > 6"
              :model-value="member.membershipStatus"
              :options="statusOptions"
              @update:model-value="onStatusChange(member, $event)"
            />
            <MultiSelect
              v-else-if="column.kind === 'areas'"
              compact
              :open-up="rowIndex >= members.length - 4 && members.length > 6"
              :model-value="member.areas"
              :options="areaOptions"
              @update:model-value="onAreasChange(member, $event)"
            />
            <select
              v-else-if="column.kind === 'documentType'"
              class="w-full min-w-44 rounded-md border border-transparent px-2 py-1.5 text-ink outline-none hover:border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              :value="member.documentType"
              @change="onDocumentTypeChange(member, $event)"
            >
              <option v-for="option in DOCUMENT_TYPE_OPTIONS" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            <input
              v-else
              :type="column.kind === 'email' ? 'email' : 'text'"
              class="w-full min-w-40 rounded-md border border-transparent px-2 py-1.5 text-ink outline-none hover:border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              :value="cellText(member, column.key)"
              @change="onTextInput(member, column.key, $event)"
            />
          </td>

          <td class="px-2 py-1.5 text-center align-top">
            <button
              v-if="!readonly"
              type="button"
              class="rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              title="Eliminar integrante"
              @click="onDelete(member)"
            >
              <i class="fa-solid fa-trash text-xs" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
