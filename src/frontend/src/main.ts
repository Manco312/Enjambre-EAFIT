import './assets/css/input.css';

import { createApp } from 'vue';

import App from '@/App.vue';
import PiniaConfig from '@/PiniaConfig';
import router from '@/router';
import { AuthService } from '@/services/AuthService';

async function bootstrap(): Promise<void> {
  const app = createApp(App);

  app.use(PiniaConfig.init());
  app.use(router);

  // Rehidrata la sesión desde el token antes de montar, para que el guard del
  // router ya tenga la sesión en el primer beforeEach.
  await AuthService.bootstrapSession();

  app.mount('#app');
}

void bootstrap();
