import { createPinia, type Pinia, type StateTree } from 'pinia';
import { watch } from 'vue';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { committeeSeeder } from '@/seeders/committeeseeder';
import { groupSeeder } from '@/seeders/groupseeder';
import { userSeeder } from '@/seeders/userseeder';

type PiniaState = Record<string, StateTree>;

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
        localStorage.setItem(STORAGE_KEYS.PINIA_STATE, JSON.stringify(state));
      },
      { deep: true },
    );

    return pinia;
  }

  private static buildInitialState(): PiniaState {
    return {
      auth: { session: null },
      user: { users: userSeeder.map((user) => ({ ...user })) },
      group: { groups: groupSeeder.map((group) => ({ ...group })) },
      committee: { committees: committeeSeeder.map((committee) => ({ ...committee })) },
    };
  }
}
