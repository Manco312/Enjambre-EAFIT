import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import { AuthService } from '@/services/AuthService';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { USER_ROLES } from '@/constants/roles';
import BoardDashboardView from '@/views/BoardDashboardView.vue';
import GroupCreateView from '@/views/GroupCreateView.vue';
import GroupDetailView from '@/views/GroupDetailView.vue';
import GroupEditView from '@/views/GroupEditView.vue';
import GroupsDashboardView from '@/views/GroupsDashboardView.vue';
import LandingView from '@/views/LandingView.vue';
import LoginView from '@/views/LoginView.vue';
import MembersView from '@/views/MembersView.vue';
import NotFoundView from '@/views/NotFoundView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_NAMES.LANDING,
    component: LandingView,
    meta: { title: 'Inicio', public: true },
  },
  {
    path: '/login',
    name: ROUTE_NAMES.LOGIN,
    component: LoginView,
    meta: { title: 'Iniciar sesión', public: true },
  },
  {
    path: '/admin/groups',
    name: ROUTE_NAMES.ADMIN_GROUPS,
    component: GroupsDashboardView,
    meta: { title: 'Grupos estudiantiles', requiresAuth: true, roles: [USER_ROLES.ADMIN] },
  },
  {
    path: '/admin/groups/create',
    name: ROUTE_NAMES.ADMIN_GROUP_CREATE,
    component: GroupCreateView,
    meta: { title: 'Crear grupo estudiantil', requiresAuth: true, roles: [USER_ROLES.ADMIN] },
  },
  {
    path: '/admin/groups/:id',
    name: ROUTE_NAMES.ADMIN_GROUP_DETAIL,
    component: GroupDetailView,
    meta: { title: 'Detalle del grupo', requiresAuth: true, roles: [USER_ROLES.ADMIN] },
  },
  {
    path: '/admin/groups/:id/edit',
    name: ROUTE_NAMES.ADMIN_GROUP_EDIT,
    component: GroupEditView,
    meta: { title: 'Editar grupo estudiantil', requiresAuth: true, roles: [USER_ROLES.ADMIN] },
  },
  {
    path: '/admin/groups/:id/members',
    name: ROUTE_NAMES.ADMIN_GROUP_MEMBERS,
    component: MembersView,
    meta: { title: 'Base de datos de integrantes', requiresAuth: true, roles: [USER_ROLES.ADMIN] },
  },
  {
    path: '/group',
    name: ROUTE_NAMES.BOARD_HOME,
    component: BoardDashboardView,
    meta: { title: 'Mi grupo', requiresAuth: true, roles: [USER_ROLES.BOARD] },
  },
  {
    path: '/group/members',
    name: ROUTE_NAMES.BOARD_MEMBERS,
    component: MembersView,
    meta: { title: 'Base de datos de integrantes', requiresAuth: true, roles: [USER_ROLES.BOARD] },
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.NOT_FOUND,
    component: NotFoundView,
    meta: { title: 'Página no encontrada', public: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => AuthService.guardRoute(to));

export default router;
