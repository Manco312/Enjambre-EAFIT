import { createPinia, type Pinia } from 'pinia';

export default class PiniaConfig {
  public static init(): Pinia {
    // Sin persistencia ni seeders: los stores arrancan vacíos y se llenan
    // desde la API.
    return createPinia();
  }
}
