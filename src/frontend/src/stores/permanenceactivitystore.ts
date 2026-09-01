import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { PermanenceActivityInterface } from '@/interfaces/PermanenceActivityInterface';

export const usePermanenceActivityStore = defineStore('permanenceActivity', () => {
  const activities = ref<PermanenceActivityInterface[]>([]);

  function addActivity(activity: PermanenceActivityInterface): void {
    activities.value.push(activity);
  }

  function updateActivity(activity: PermanenceActivityInterface): void {
    const index = activities.value.findIndex(
      (item: PermanenceActivityInterface) => item.id === activity.id,
    );
    if (index !== -1) {
      activities.value.splice(index, 1, activity);
    }
  }

  function removeActivity(id: number): void {
    activities.value = activities.value.filter(
      (item: PermanenceActivityInterface) => item.id !== id,
    );
  }

  return { activities, addActivity, updateActivity, removeActivity };
});
