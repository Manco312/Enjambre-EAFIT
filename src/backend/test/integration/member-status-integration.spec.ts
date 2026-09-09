import 'dotenv/config';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';

import { TestAppModule } from './test-app.module.js';
import { Group } from '../../src/groups/entities/group.entity.js';
import { User } from '../../src/users/entities/user.entity.js';

describe('Member statuses integration', () => {
  let app: INestApplication;
  let groupsRepository: Repository<Group>;
  let usersRepository: Repository<User>;

  let adminToken: string;
  let group: Group;

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

    groupsRepository = module.get<Repository<Group>>(
      getRepositoryToken(Group),
    );

    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));

    await app.init();

    group = await groupsRepository.save(
      groupsRepository.create({
        name: 'Member Statuses Test Group',
      }),
    );

    const admin = usersRepository.create({
      username: 'statuses.admin',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
      group: null,
    });

    await usersRepository.save(admin);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'statuses.admin',
        password: 'admin123',
      })
      .expect(200);

    adminToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should create a member status as ADMIN', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/member-statuses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Active',
        groupId: group.id,
        target: 100,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: 'Active',
        target: 100,
        groupId: group.id,
      }),
    );
  });

  it('should list member statuses', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/member-statuses')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Active',
        }),
      ]),
    );
  });

  it('should return a member status by id', async () => {
    const memberStatus = await request(app.getHttpServer())
      .post('/api/member-statuses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Status By Id',
        groupId: group.id,
        target: 50,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/api/member-statuses/${memberStatus.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: memberStatus.body.id,
        name: 'Status By Id',
        target: 50,
      }),
    );
  });

  it('should list member statuses by group', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/member-statuses?groupId=${group.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          groupId: group.id,
        }),
      ]),
    );
  });

  it('should update a member status as ADMIN', async () => {
    const memberStatus = await request(app.getHttpServer())
      .post('/api/member-statuses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Status Before Update',
        groupId: group.id,
        target: 10,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/api/member-statuses/${memberStatus.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Status After Update',
        target: 20,
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: memberStatus.body.id,
        name: 'Status After Update',
        target: 20,
      }),
    );
  });

  it('should delete a member status as ADMIN', async () => {
    const memberStatus = await request(app.getHttpServer())
      .post('/api/member-statuses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Status To Delete',
        groupId: group.id,
        target: 5,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/member-statuses/${memberStatus.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/member-statuses/${memberStatus.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
