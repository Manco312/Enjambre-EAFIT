import 'dotenv/config';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';

import { TestAppModule } from './test-app.module.js';
import { User } from '../../src/users/entities/user.entity.js';

// Recorre el flujo completo como ADMIN (que no pertenece a ningún grupo) y
// comprueba las reglas de negocio que cruzan varios recursos.
describe('Validation rules integration', () => {
  let app: INestApplication;
  let adminToken: string;

  let groupId: number;
  let otherGroupId: number;
  let committeeId: number;
  let statusId: number;
  let memberId: number;

  const api = (
    method: 'get' | 'post' | 'patch' | 'delete',
    url: string,
    body?: Record<string, unknown>,
  ) => {
    const call = request(app.getHttpServer())
      [method](`/api${url}`)
      .set('Authorization', `Bearer ${adminToken}`);

    return body === undefined ? call : call.send(body);
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    const usersRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    );

    await usersRepository.save(
      usersRepository.create({
        username: 'rules.admin',
        password: await bcrypt.hash('admin123', 12),
        role: 'ADMIN',
        group: null,
      }),
    );

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'rules.admin', password: 'admin123' })
      .expect(200);

    adminToken = loginResponse.body.access_token;

    groupId = (
      await api('post', '/groups', { name: 'Rules Group' }).expect(201)
    ).body.id;
    otherGroupId = (
      await api('post', '/groups', { name: 'Other Rules Group' }).expect(201)
    ).body.id;
    committeeId = (
      await api('post', '/committees', {
        name: 'Comunicaciones',
        groupId,
      }).expect(201)
    ).body.id;
    statusId = (
      await api('post', '/member-statuses', {
        name: 'Activo',
        groupId,
        target: 70,
      }).expect(201)
    ).body.id;
    memberId = (
      await api('post', '/members', {
        idEpik: 7001,
        fullName: 'Rules Member',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '7000000001',
        email: 'rules.member@test.com',
        phone: '3007000001',
        program: 'Ingeniería',
        committeeIds: [committeeId],
        groupId,
        memberStatusId: statusId,
      }).expect(201)
    ).body.id;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('lets an admin without group read its own session', async () => {
    const response = await api('get', '/auth/me').expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({ role: 'ADMIN', groupId: null }),
    );
  });

  describe('groups', () => {
    it('rejects a duplicated name ignoring case and spaces', async () => {
      const response = await api('post', '/groups', {
        name: '  rules group ',
      }).expect(409);

      expect(response.body.message).toBe(
        'Ya existe un grupo estudiantil con el nombre «rules group».',
      );
    });

    it.each([['ab'], ['   '], ['x'.repeat(256)]])(
      'rejects the name %j',
      async (name) => {
        await api('post', '/groups', { name }).expect(400);
      },
    );
  });

  describe('board users', () => {
    it.each([
      ['a short username', { username: 'abc' }],
      ['a username with spaces', { username: 'junta rules' }],
      ['a short password', { password: '12345' }],
    ])('rejects %s', async (_label, override) => {
      await api('post', '/users', {
        username: 'junta.rules',
        password: 'secret123',
        groupId,
        ...override,
      }).expect(400);
    });

    it('reports a taken username as a conflict', async () => {
      await api('post', '/users', {
        username: 'junta.rules',
        password: 'secret123',
        groupId,
      }).expect(201);

      const response = await api('post', '/users', {
        username: 'junta.rules',
        password: 'secret123',
        groupId: otherGroupId,
      }).expect(409);

      expect(response.body.message).toBe(
        'El nombre de usuario ya está en uso.',
      );
    });
  });

  describe('member statuses', () => {
    it.each([[-1], [101], [50.5]])('rejects the target %d', async (target) => {
      await api('post', '/member-statuses', {
        name: `Estado ${target}`,
        groupId,
        target,
      }).expect(400);
    });

    it('rejects a duplicated name inside the group', async () => {
      await api('post', '/member-statuses', {
        name: 'ACTIVO',
        groupId,
        target: 10,
      }).expect(409);
    });

    it('allows the same name in another group', async () => {
      await api('post', '/member-statuses', {
        name: 'Activo',
        groupId: otherGroupId,
        target: 10,
      }).expect(201);
    });

    it('explains why a status with members cannot be deleted', async () => {
      const response = await api(
        'delete',
        `/member-statuses/${statusId}`,
      ).expect(409);

      expect(response.body.message).toContain('tiene integrantes asignados');
    });

    it('rejects assigning a status from another group to a member', async () => {
      const foreignStatus = await api('post', '/member-statuses', {
        name: 'Ajeno',
        groupId: otherGroupId,
        target: 10,
      }).expect(201);
      const links = await api(
        'get',
        `/group-members?groupId=${groupId}`,
      ).expect(200);

      await api('patch', `/group-members/${links.body[0].id}`, {
        memberStatusId: foreignStatus.body.id,
      }).expect(400);
    });
  });

  describe('activities', () => {
    const activity = (override: Record<string, unknown> = {}) => ({
      name: 'Asambleas',
      weight: 40,
      groupId,
      committeeId: null,
      ...override,
    });

    it('creates an activity without description', async () => {
      const response = await api('post', '/activities', activity()).expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({ description: '', weight: 40 }),
      );
      expect(response.body.period).toMatch(/^\d{4}-[12]$/);
    });

    it.each([[0], [-10], [101], [33.3]])(
      'rejects the weight %d',
      async (weight) => {
        await api(
          'post',
          '/activities',
          activity({ name: `Peso ${weight}`, weight }),
        ).expect(400);
      },
    );

    it('rejects a whitespace-only name', async () => {
      await api('post', '/activities', activity({ name: '   ' })).expect(400);
    });

    it('does not let a sheet add up to more than 100%', async () => {
      await api(
        'post',
        '/activities',
        activity({ name: 'Eventos', weight: 60 }),
      ).expect(201);

      const response = await api(
        'post',
        '/activities',
        activity({ name: 'Extra', weight: 1 }),
      ).expect(400);

      expect(response.body.message).toBe(
        'Los pesos de las actividades de la hoja no pueden sumar más de 100%. Disponible: 0%.',
      );
    });

    it('counts each committee sheet separately', async () => {
      await api(
        'post',
        '/activities',
        activity({ name: 'Publicaciones', weight: 100, committeeId }),
      ).expect(201);
    });

    it('rejects a committee from another group', async () => {
      const foreignCommittee = await api('post', '/committees', {
        name: 'Ajeno',
        groupId: otherGroupId,
      }).expect(201);

      await api(
        'post',
        '/activities',
        activity({ name: 'Cruzada', committeeId: foreignCommittee.body.id }),
      ).expect(400);
    });

    it('does not let the weight drop below a recorded score', async () => {
      const activities = await api(
        'get',
        `/activities?groupId=${groupId}`,
      ).expect(200);
      const assemblies = activities.body.find(
        (item: { name: string }) => item.name === 'Asambleas',
      );

      await api('post', '/permanences', {
        percentage: 35,
        memberId,
        activityId: assemblies.id,
      }).expect(201);

      const response = await api('patch', `/activities/${assemblies.id}`, {
        weight: 30,
      }).expect(400);

      expect(response.body.message).toContain('hasta 35 puntos');

      await api('patch', `/activities/${assemblies.id}`, {
        weight: 35,
      }).expect(200);
    });
  });

  describe('committees', () => {
    it('rejects a duplicated name inside the group', async () => {
      await api('post', '/committees', {
        name: ' comunicaciones',
        groupId,
      }).expect(409);
    });

    it('drops the committee scores when a member leaves the committee', async () => {
      const activities = await api(
        'get',
        `/activities?committeeId=${committeeId}`,
      ).expect(200);

      await api('post', '/permanences', {
        percentage: 80,
        memberId,
        activityId: activities.body[0].id,
      }).expect(201);

      await api('patch', `/members/${memberId}`, {
        committeeIds: [],
        groupId,
      }).expect(200);

      const scores = await api(
        'get',
        `/permanences?activityId=${activities.body[0].id}`,
      ).expect(200);

      expect(scores.body).toEqual([]);

      // Ya no está en el comité: no se le puede puntuar ahí.
      await api('post', '/permanences', {
        percentage: 10,
        memberId,
        activityId: activities.body[0].id,
      }).expect(400);
    });

    it('can delete a committee that still has members', async () => {
      await api('patch', `/members/${memberId}`, {
        committeeIds: [committeeId],
        groupId,
      }).expect(200);

      await api('delete', `/committees/${committeeId}`).expect(200);

      const member = await api('get', `/members/${memberId}`).expect(200);

      expect(member.body.committeeIds).toEqual([]);
    });
  });
});
