import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { UserInterface } from '@/interfaces/UserInterface';

export const useUserStore = defineStore('user', () => {
  const users = ref<UserInterface[]>([]);

  function addUser(user: UserInterface): void {
    users.value.push(user);
  }

  function removeUser(id: number): void {
    users.value = users.value.filter((item: UserInterface) => item.id !== id);
  }

  return { users, addUser, removeUser };
});
