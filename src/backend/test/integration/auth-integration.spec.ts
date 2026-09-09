import 'dotenv/config';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TestAppModule } from './test-app.module.js';
import { Group } from '../../src/groups/entities/group.entity.js';
import { UsersService } from '../../src/users/users.service.js';

describe('Auth integration', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let groupsRepository: Repository<Group>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = module.createNestApplication();

    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    usersService = module.get<UsersService>(UsersService);
    groupsRepository = module.get<Repository<Group>>(getRepositoryToken(Group));

    const group = groupsRepository.create({
      name: 'Test Group',
    });

    await groupsRepository.save(group);

    await usersService.create({
      username: 'john',
      password: 'password123',
      groupId: group.id,
    });

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should login with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'john',
        password: 'password123',
      })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
    expect(typeof response.body.access_token).toBe('string');
    expect(response.body.access_token.length).toBeGreaterThan(0);
  });

  it('should return the authenticated user from /me', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'john',
        password: 'password123',
      })
      .expect(200);

    const token = loginResponse.body.access_token;

    const response = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      userId: expect.any(Number),
      username: 'john',
      role: 'BOARD',
      groupId: expect.any(Number),
    });
  });
});
