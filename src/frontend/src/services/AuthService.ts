import axios from 'axios';
import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router';

import type { AuthSessionInterface } from '@/interfaces/AuthSessionInterface';
import type { LoginDTO } from '@/dtos/LoginDTO';
import type { Nullable } from '@/types/Nullable';
import type { UserRole } from '@/types/UserRole';
import { DomainError } from '@/utils/DomainError';
import { ENVIRONMENT } from '@/constants/environment';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { USER_ROLES } from '@/constants/roles';
import { useAuthStore } from '@/stores/authstore';

interface LoginResponse {
  access_token: string;
}

const AUTH_URL = `${ENVIRONMENT.API_URL}/auth`;

export class AuthService {
  public static async login(dto: LoginDTO): Promise<AuthSessionInterface> {
    let token: string;
    try {
      const { data } = await axios.post<LoginResponse>(`${AUTH_URL}/login`, dto);
      token = data.access_token;
    } catch {
      throw new DomainError('INVALID_CREDENTIALS');
    }

    AuthService.applyToken(token);
    const session = await AuthService.fetchSession();
    useAuthStore().setSession(session);
    return session;
  }

  // Rehidrata la sesión al arrancar la app a partir del token guardado.
  public static async bootstrapSession(): Promise<void> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token === null) {
      return;
    }

    AuthService.applyToken(token);
    try {
      useAuthStore().setSession(await AuthService.fetchSession());
    } catch {
      AuthService.clearToken();
      useAuthStore().setSession(null);
    }
  }

  public static logout(): void {
    AuthService.clearToken();
    useAuthStore().setSession(null);
  }

  public static getSession(): Nullable<AuthSessionInterface> {
    return useAuthStore().session;
  }

  public static isAuthenticated(): boolean {
    return AuthService.getSession() !== null;
  }

  public static hasRole(role: UserRole): boolean {
    return AuthService.getSession()?.role === role;
  }

  public static resolveHomeRouteName(): string {
    const session = AuthService.getSession();

    if (session?.role === USER_ROLES.ADMIN) {
      return ROUTE_NAMES.ADMIN_GROUPS;
    }

    if (session?.role === USER_ROLES.BOARD) {
      return ROUTE_NAMES.BOARD_HOME;
    }

    return ROUTE_NAMES.LOGIN;
  }

  public static guardRoute(to: RouteLocationNormalized): true | RouteLocationRaw {
    const session = AuthService.getSession();
    const isPublic = to.meta.public === true;

    if (!isPublic && session === null) {
      return { name: ROUTE_NAMES.LOGIN };
    }

    if (session !== null && to.name === ROUTE_NAMES.LOGIN) {
      return { name: AuthService.resolveHomeRouteName() };
    }

    const allowedRoles: UserRole[] | undefined = to.meta.roles;
    if (session !== null && allowedRoles !== undefined && !allowedRoles.includes(session.role)) {
      return { name: AuthService.resolveHomeRouteName() };
    }

    return true;
  }

  private static async fetchSession(): Promise<AuthSessionInterface> {
    const { data } = await axios.get<AuthSessionInterface>(`${AUTH_URL}/me`);
    return data;
  }

  private static applyToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  private static clearToken(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    delete axios.defaults.headers.common.Authorization;
  }
}
