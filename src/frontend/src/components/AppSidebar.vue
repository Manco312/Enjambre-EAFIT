<script setup lang="ts">
/* External Imports */
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

/* Internal Imports */
import BrandMark from '@/components/BrandMark.vue';
import type { RouteName } from '@/types/RouteName';
import { AuthService } from '@/services/AuthService';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { USER_ROLES } from '@/constants/roles';

/* Types */
interface NavItem {
  label: string;
  icon: string;
  routeName: RouteName;
}

/* Selectors */
const session = computed(() => AuthService.getSession());

const navItems = computed<NavItem[]>(() => {
  if (session.value?.role === USER_ROLES.ADMIN) {
    return [
      {
        label: 'Grupos estudiantiles',
        icon: 'fa-layer-group',
        routeName: ROUTE_NAMES.ADMIN_GROUPS,
      },
      { label: 'Crear grupo', icon: 'fa-plus', routeName: ROUTE_NAMES.ADMIN_GROUP_CREATE },
    ];
  }

  if (session.value?.role === USER_ROLES.BOARD) {
    return [{ label: 'Mi grupo', icon: 'fa-people-group', routeName: ROUTE_NAMES.BOARD_HOME }];
  }

  return [];
});

const roleLabel = computed<string>(() =>
  session.value?.role === USER_ROLES.ADMIN ? 'Desarrollo Estudiantil' : 'Junta directiva',
);
</script>

<template>
  <aside class="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-brand-800 lg:flex">
    <div class="px-6 py-6">
      <BrandMark tone="light" />
    </div>

    <nav class="flex-1 space-y-1 px-3">
      <RouterLink
        v-for="item in navItems"
        :key="item.routeName"
        :to="{ name: item.routeName }"
        class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-100 transition hover:bg-white/10"
        active-class="bg-white/15 text-white"
      >
        <i class="fa-solid w-4 text-center" :class="item.icon" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="border-t border-white/10 px-6 py-5">
      <p class="text-sm font-semibold text-white">{{ session?.username }}</p>
      <p class="text-xs text-brand-200">{{ roleLabel }}</p>
    </div>
  </aside>
</template>
