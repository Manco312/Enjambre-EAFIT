import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';

export const useCommitteeStore = defineStore('committee', () => {
  const committees = ref<CommitteeInterface[]>([]);

  function addCommittee(committee: CommitteeInterface): void {
    committees.value.push(committee);
  }

  function updateCommittee(committee: CommitteeInterface): void {
    const index = committees.value.findIndex(
      (item: CommitteeInterface) => item.id === committee.id,
    );
    if (index !== -1) {
      committees.value.splice(index, 1, committee);
    }
  }

  function removeCommittee(id: number): void {
    committees.value = committees.value.filter((item: CommitteeInterface) => item.id !== id);
  }

  return { committees, addCommittee, updateCommittee, removeCommittee };
});
