import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { PermanenceTargetInterface } from '@/interfaces/PermanenceTargetInterface';

export const usePermanenceTargetStore = defineStore('permanenceTarget', () => {
  const targets = ref<PermanenceTargetInterface[]>([]);

  function addTarget(target: PermanenceTargetInterface): void {
    targets.value.push(target);
  }

  function updateTarget(target: PermanenceTargetInterface): void {
    const index = targets.value.findIndex(
      (item: PermanenceTargetInterface) => item.id === target.id,
    );
    if (index !== -1) {
      targets.value.splice(index, 1, target);
    }
  }

  function removeTarget(id: number): void {
    targets.value = targets.value.filter((item: PermanenceTargetInterface) => item.id !== id);
  }

  return { targets, addTarget, updateTarget, removeTarget };
});
