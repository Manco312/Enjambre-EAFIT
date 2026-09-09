import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard.js';
import { USER_ROLES } from './roles.js';

function contextWithUser(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => () => undefined,
    getClass: () => class {},
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows the request when the handler has no @Roles()', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(contextWithUser({ role: USER_ROLES.BOARD }))).toBe(
      true,
    );
  });

  it('allows the request when the user has one of the required roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      USER_ROLES.ADMIN,
    ]);

    expect(guard.canActivate(contextWithUser({ role: USER_ROLES.ADMIN }))).toBe(
      true,
    );
  });

  it('rejects the request when the user role is not allowed', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      USER_ROLES.ADMIN,
    ]);

    expect(() =>
      guard.canActivate(contextWithUser({ role: USER_ROLES.BOARD })),
    ).toThrow(ForbiddenException);
  });

  it('rejects the request when there is no authenticated user', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      USER_ROLES.ADMIN,
    ]);

    expect(() => guard.canActivate(contextWithUser(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
