import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { MemberInterface } from '@/interfaces/MemberInterface';

export const useMemberStore = defineStore('member', () => {
  const members = ref<MemberInterface[]>([]);

  function addMember(member: MemberInterface): void {
    members.value.push(member);
  }

  function updateMember(member: MemberInterface): void {
    const index = members.value.findIndex((item: MemberInterface) => item.id === member.id);
    if (index !== -1) {
      members.value.splice(index, 1, member);
    }
  }

  function removeMember(id: number): void {
    members.value = members.value.filter((item: MemberInterface) => item.id !== id);
  }

  return { members, addMember, updateMember, removeMember };
});
