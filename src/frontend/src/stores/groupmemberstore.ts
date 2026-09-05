import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { GroupMemberInterface } from '@/interfaces/GroupMemberInterface';

export const useGroupMemberStore = defineStore('groupMember', () => {
  const groupMembers = ref<GroupMemberInterface[]>([]);

  function addGroupMember(groupMember: GroupMemberInterface): void {
    groupMembers.value.push(groupMember);
  }

  function updateGroupMember(groupMember: GroupMemberInterface): void {
    const index = groupMembers.value.findIndex(
      (item: GroupMemberInterface) => item.id === groupMember.id,
    );
    if (index !== -1) {
      groupMembers.value.splice(index, 1, groupMember);
    }
  }

  function removeGroupMember(id: number): void {
    groupMembers.value = groupMembers.value.filter((item: GroupMemberInterface) => item.id !== id);
  }

  return { groupMembers, addGroupMember, updateGroupMember, removeGroupMember };
});
