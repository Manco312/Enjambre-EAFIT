<script setup lang="ts">
/* Internal Imports */
import MultiSelect from '@/components/MultiSelect.vue';
import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import type { DocumentType } from '@/types/DocumentType';
import type { MemberStatusInterface } from '@/interfaces/MemberStatusInterface';
import type { MemberWithMembership } from '@/services/MemberService';
import type { UpdateMemberDTO } from '@/dtos/UpdateMemberDTO';
import { DOCUMENT_TYPE_OPTIONS } from '@/constants/documentTypes';
import { MEMBER_COLUMNS } from '@/constants/memberColumns';
import { MemberService } from '@/services/MemberService';

/* Props */
const props = withDefaults(
  defineProps<{
    members: MemberWithMembership[];
    committees: CommitteeInterface[];
    statuses: MemberStatusInterface[];
    columnFilters: Partial<Record<string, string>>;
    readonly?: boolean;
  }>(),
  { readonly: false },
);

/* Emits */
const emit = defineEmits<{
  update: [id: number, dto: UpdateMemberDTO];
  updateStatus: [id: number, memberStatusId: number];
  delete: [id: number];
  filterChange: [key: string, value: string];
}>();

/* Functions */
function cellText(member: MemberWithMembership, key: string): string {
  return MemberService.fieldToText(member, key);
}

function filterValue(key: string): string {
  return props.columnFilters[key] ?? '';
}

function onFilterInput(key: string, event: Event): void {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  emit('filterChange', key, target.value);
}

function onTextInput(member: MemberWithMembership, key: string, event: Event): void {
  const target = event.target as HTMLInputElement;
  const value = key === 'idEpik' ? Number(target.value) : target.value;
  emit('update', member.id, { [key]: value } as UpdateMemberDTO);
}

function onDocumentTypeChange(member: MemberWithMembership, event: Event): void {
  const target = event.target as HTMLSelectElement;
  emit('update', member.id, { documentType: target.value as DocumentType });
}

function onStatusChange(member: MemberWithMembership, event: Event): void {
  const target = event.target as HTMLSelectElement;
  emit('updateStatus', member.id, Number(target.value));
}

function committeeNames(member: MemberWithMembership): string[] {
  return MemberService.getCommitteeNames(member);
}

function onAreasChange(member: MemberWithMembership, names: string[]): void {
  const committeeIds = props.committees
    .filter((committee: CommitteeInterface) => names.includes(committee.name))
    .map((committee: CommitteeInterface) => committee.id);
  emit('update', member.id, { committeeIds });
}

function onDelete(member: MemberWithMembership): void {
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

            <select
              v-else-if="column.kind === 'membershipStatus'"
              class="w-full min-w-40 rounded-md border border-transparent px-2 py-1.5 text-ink outline-none hover:border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              :value="member.memberStatusId"
              @change="onStatusChange(member, $event)"
            >
              <option v-for="status in statuses" :key="status.id" :value="status.id">
                {{ status.name }}
              </option>
            </select>
            <MultiSelect
              v-else-if="column.kind === 'areas'"
              compact
              :open-up="rowIndex >= members.length - 4 && members.length > 6"
              :model-value="committeeNames(member)"
              :options="committees.map((committee) => committee.name)"
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
              :type="
                column.kind === 'email' ? 'email' : column.key === 'idEpik' ? 'number' : 'text'
              "
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
