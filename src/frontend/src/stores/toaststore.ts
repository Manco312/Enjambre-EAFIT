import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { ToastInterface } from '@/types/Toast';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastInterface[]>([]);

  function addToast(toast: ToastInterface): void {
    toasts.value.push(toast);
  }

  function updateToast(toast: ToastInterface): void {
    const index = toasts.value.findIndex((item: ToastInterface) => item.id === toast.id);
    if (index !== -1) {
      toasts.value.splice(index, 1, toast);
    }
  }

  function removeToast(id: number): void {
    toasts.value = toasts.value.filter((item: ToastInterface) => item.id !== id);
  }

  return { toasts, addToast, updateToast, removeToast };
});
