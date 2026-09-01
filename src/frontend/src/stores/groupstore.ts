import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { GroupInterface } from '@/interfaces/GroupInterface';

export const useGroupStore = defineStore('group', () => {
  const groups = ref<GroupInterface[]>([]);

  function addGroup(group: GroupInterface): void {
    groups.value.push(group);
  }

  function updateGroup(group: GroupInterface): void {
    const index = groups.value.findIndex((item: GroupInterface) => item.id === group.id);
    if (index !== -1) {
      groups.value.splice(index, 1, group);
    }
  }

  function removeGroup(id: number): void {
    groups.value = groups.value.filter((item: GroupInterface) => item.id !== id);
  }

  return { groups, addGroup, updateGroup, removeGroup };
});
