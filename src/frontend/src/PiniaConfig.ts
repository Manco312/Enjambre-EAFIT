import { createPinia, type Pinia, type StateTree } from 'pinia';
import { watch } from 'vue';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { committeeSeeder } from '@/seeders/committeeseeder';
import { groupSeeder } from '@/seeders/groupseeder';
import { memberSeeder } from '@/seeders/memberseeder';
import { memberStatusSeeder } from '@/seeders/memberstatusseeder';
import { userSeeder } from '@/seeders/userseeder';

type PiniaState = Record<string, StateTree>;

// Stores que son estado transitorio de UI y no deben persistirse en localStorage.
const NON_PERSISTED_STORES: string[] = ['toast'];

export default class PiniaConfig {
  public static init(): Pinia {
    const pinia = createPinia();
    const savedState = localStorage.getItem(STORAGE_KEYS.PINIA_STATE);

    if (savedState !== null) {
      pinia.state.value = JSON.parse(savedState) as PiniaState;
    } else {
      pinia.state.value = PiniaConfig.buildInitialState();
      localStorage.setItem(STORAGE_KEYS.PINIA_STATE, JSON.stringify(pinia.state.value));
    }

    watch(
      pinia.state,
      (state: PiniaState): void => {
        PiniaConfig.persist(state);
      },
      { deep: true },
    );

    return pinia;
  }

  private static persist(state: PiniaState): void {
    const snapshot: PiniaState = {};
    Object.keys(state).forEach((storeId: string) => {
      const value = state[storeId];
      if (value !== undefined && !NON_PERSISTED_STORES.includes(storeId)) {
        snapshot[storeId] = value;
      }
    });
    localStorage.setItem(STORAGE_KEYS.PINIA_STATE, JSON.stringify(snapshot));
  }

  private static buildInitialState(): PiniaState {
    return {
      auth: { session: null },
      user: { users: userSeeder.map((user) => ({ ...user })) },
      group: { groups: groupSeeder.map((group) => ({ ...group })) },
      committee: { committees: committeeSeeder.map((committee) => ({ ...committee })) },
      memberStatus: {
        memberStatuses: memberStatusSeeder.map((status) => ({ ...status })),
      },
      member: {
        members: memberSeeder.map((member) => ({
          ...member,
          membershipStatus: [...member.membershipStatus],
          areas: [...member.areas],
        })),
      },
    };
  }
}
