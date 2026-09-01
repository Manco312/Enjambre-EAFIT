import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { MemberStatusInterface } from '@/interfaces/MemberStatusInterface';

export const useMemberStatusStore = defineStore('memberStatus', () => {
  const memberStatuses = ref<MemberStatusInterface[]>([]);

  function addMemberStatus(memberStatus: MemberStatusInterface): void {
    memberStatuses.value.push(memberStatus);
  }

  function updateMemberStatus(memberStatus: MemberStatusInterface): void {
    const index = memberStatuses.value.findIndex(
      (item: MemberStatusInterface) => item.id === memberStatus.id,
    );
    if (index !== -1) {
      memberStatuses.value.splice(index, 1, memberStatus);
    }
  }

  function removeMemberStatus(id: number): void {
    memberStatuses.value = memberStatuses.value.filter(
      (item: MemberStatusInterface) => item.id !== id,
    );
  }

  return { memberStatuses, addMemberStatus, updateMemberStatus, removeMemberStatus };
});
