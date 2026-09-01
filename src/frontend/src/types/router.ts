import 'vue-router';

import type { UserRole } from '@/types/UserRole';

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
    public?: boolean;
    requiresAuth?: boolean;
    roles?: UserRole[];
  }
}
