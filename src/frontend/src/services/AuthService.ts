import type { AuthSessionInterface } from '@/interfaces/AuthSessionInterface';
import type { LoginDTO } from '@/dtos/LoginDTO';
import type { Nullable } from '@/types/Nullable';
import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router';
import type { UserInterface } from '@/interfaces/UserInterface';
import type { UserRole } from '@/types/UserRole';
import { DomainError } from '@/utils/DomainError';
import { ROUTE_NAMES } from '@/constants/routeNames';
import { USER_ROLES } from '@/constants/roles';
import { UserService } from '@/services/UserService';
import { useAuthStore } from '@/stores/authstore';

export class AuthService {
  public static login(dto: LoginDTO): AuthSessionInterface {
    const user: Nullable<UserInterface> = UserService.getUserByUsername(dto.username);

    if (user === null || user.password !== dto.password) {
      throw new DomainError('INVALID_CREDENTIALS');
    }

    const session: AuthSessionInterface = {
      userId: user.id,
      username: user.username,
      role: user.role,
      groupId: user.groupId,
    };

    useAuthStore().setSession(session);
    return session;
  }

  public static logout(): void {
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
}
