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

describe('Users integration', () => {
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
        name: 'Users Test Group',
      }),
    );

    const admin = usersRepository.create({
      username: 'users.admin',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
      group: null,
    });

    await usersRepository.save(admin);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'users.admin',
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

  it('should create a board user as ADMIN without exposing the password', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'board.user',
        password: 'boardPassword123',
        groupId: group.id,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        username: 'board.user',
        role: 'BOARD',
      }),
    );
    expect(response.body.password).toBeUndefined();
  });

  it('should allow the newly created user to log in', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'board.user',
        password: 'boardPassword123',
      })
      .expect(200);

    expect(loginResponse.body).toHaveProperty('access_token');
    expect(typeof loginResponse.body.access_token).toBe('string');
  });
});
