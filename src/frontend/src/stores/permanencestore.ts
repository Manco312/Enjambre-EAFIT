import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { PermanenceInterface } from '@/interfaces/PermanenceInterface';

export const usePermanenceStore = defineStore('permanence', () => {
  const permanences = ref<PermanenceInterface[]>([]);

  function addPermanence(permanence: PermanenceInterface): void {
    permanences.value.push(permanence);
  }

  function updatePermanence(permanence: PermanenceInterface): void {
    const index = permanences.value.findIndex(
      (item: PermanenceInterface) => item.id === permanence.id,
    );
    if (index !== -1) {
      permanences.value.splice(index, 1, permanence);
    }
  }

  function removePermanences(predicate: (permanence: PermanenceInterface) => boolean): void {
    permanences.value = permanences.value.filter((item: PermanenceInterface) => !predicate(item));
  }

  return { permanences, addPermanence, updatePermanence, removePermanences };
});
