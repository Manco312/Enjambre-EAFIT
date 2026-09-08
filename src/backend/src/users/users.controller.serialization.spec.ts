import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';

// Verifica que ClassSerializerInterceptor + @Exclude() dejan fuera el hash de
// la contraseña de la respuesta de POST /users.
describe('UsersController serialization', () => {
  let app: INestApplication;
  const usersService = { create: vi.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        // Sin AuthGuard/RolesGuard globales en este test aislado; este deja pasar.
        { provide: APP_GUARD, useValue: { canActivate: () => true } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('omits password (and keeps the rest) in the response body', async () => {
    const saved = Object.assign(new User(), {
      id: 2,
      username: 'junta.spie',
      password: '$2b$12$hashedsecret',
      role: 'BOARD',
      group: { id: 1, name: 'SPIE' },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    usersService.create.mockResolvedValue(saved);

    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ username: 'junta.spie', password: 'junta123', groupId: 1 })
      .expect(201);

    expect(res.body.password).toBeUndefined();
    expect(res.body).toMatchObject({
      id: 2,
      username: 'junta.spie',
      role: 'BOARD',
    });
  });
});
