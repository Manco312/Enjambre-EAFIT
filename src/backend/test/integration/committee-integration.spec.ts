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

describe('Committees integration', () => {
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
        name: 'Committees Test Group',
      }),
    );

    const admin = usersRepository.create({
      username: 'committees.admin',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
      group: null,
    });

    await usersRepository.save(admin);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'committees.admin',
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

  it('should create a committee as ADMIN', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/committees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Marketing',
        groupId: group.id,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: 'Marketing',
        groupId: group.id,
      }),
    );
  });

  it('should list committees', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/committees')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Marketing',
        }),
      ]),
    );
  });

  it('should return a committee by id', async () => {
    const committee = await request(app.getHttpServer())
      .post('/api/committees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Committee By Id',
        groupId: group.id,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/api/committees/${committee.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: committee.body.id,
        name: 'Committee By Id',
      }),
    );
  });

  it('should list committees by group', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/committees?groupId=${group.id}`)
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

  it('should update a committee as ADMIN', async () => {
    const committee = await request(app.getHttpServer())
      .post('/api/committees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Committee Before Update',
        groupId: group.id,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/api/committees/${committee.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Committee After Update',
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: committee.body.id,
        name: 'Committee After Update',
      }),
    );
  });

  it('should delete a committee as ADMIN', async () => {
    const committee = await request(app.getHttpServer())
      .post('/api/committees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Committee To Delete',
        groupId: group.id,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/committees/${committee.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/committees/${committee.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
