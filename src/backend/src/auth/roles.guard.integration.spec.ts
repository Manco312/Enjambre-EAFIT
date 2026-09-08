import { Controller, Get, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AuthGuard } from './auth.guard.js';
import { RolesGuard } from './roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { USER_ROLES } from './roles.js';

const SECRET = 'integration-secret';

@Controller()
class ProbeController {
  @Public()
  @Get('open')
  open() {
    return { ok: 'public' };
  }

  @Get('any-auth')
  anyAuth() {
    return { ok: 'any-auth' };
  }

  @Roles(USER_ROLES.ADMIN)
  @Get('admin-only')
  adminOnly() {
    return { ok: 'admin-only' };
  }
}

describe('AuthGuard + RolesGuard (integration)', () => {
  let app: INestApplication;
  let adminToken: string;
  let boardToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ global: true, secret: SECRET })],
      controllers: [ProbeController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const jwt = app.get(JwtService);
    adminToken = jwt.sign({ sub: 1, username: 'admin', role: USER_ROLES.ADMIN });
    boardToken = jwt.sign({ sub: 2, username: 'junta', role: USER_ROLES.BOARD });
  });

  afterAll(async () => {
    await app.close();
  });

  const get = (path: string, token?: string) => {
    const req = request(app.getHttpServer()).get(path);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  it('lets a public route through without a token', () => get('/open').expect(200));

  it('blocks a non-public route without a token (AuthGuard runs first)', () =>
    get('/any-auth').expect(401));

  it('allows any authenticated user on a route without @Roles()', () =>
    get('/any-auth', boardToken).expect(200));

  it('returns 401 (not 403) on an @Roles() route without a token', () =>
    get('/admin-only').expect(401));

  it('forbids a BOARD user on an ADMIN-only route', () =>
    get('/admin-only', boardToken).expect(403));

  it('allows an ADMIN user on an ADMIN-only route', () =>
    get('/admin-only', adminToken).expect(200));
});
