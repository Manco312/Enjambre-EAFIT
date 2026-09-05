import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { ActivityInterface } from '@/interfaces/ActivityInterface';

export const useActivityStore = defineStore('activity', () => {
  const activities = ref<ActivityInterface[]>([]);

  function addActivity(activity: ActivityInterface): void {
    activities.value.push(activity);
  }

  function updateActivity(activity: ActivityInterface): void {
    const index = activities.value.findIndex((item: ActivityInterface) => item.id === activity.id);
    if (index !== -1) {
      activities.value.splice(index, 1, activity);
    }
  }

  function removeActivity(id: number): void {
    activities.value = activities.value.filter((item: ActivityInterface) => item.id !== id);
  }

  return { activities, addActivity, updateActivity, removeActivity };
});
