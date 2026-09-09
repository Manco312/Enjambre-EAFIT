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

describe('Groups integration', () => {
  let app: INestApplication;
  let groupsRepository: Repository<Group>;
  let usersRepository: Repository<User>;

  let adminToken: string;

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

    usersRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    );

    await app.init();

    const admin = usersRepository.create({
      username: 'admin',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
      group: null,
    });

    await usersRepository.save(admin);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'admin',
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

  it('should list groups', async () => {
    await groupsRepository.save(
      groupsRepository.create({
        name: 'Test Group',
      }),
    );

    const response = await request(app.getHttpServer())
      .get('/api/groups')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Test Group',
        }),
      ]),
    );
  });

  it('should return a group by id', async () => {
    const group = await groupsRepository.save(
      groupsRepository.create({
        name: 'Group By Id',
      }),
    );

    const response = await request(app.getHttpServer())
      .get(`/api/groups/${group.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: group.id,
        name: 'Group By Id',
      }),
    );
  });

  it('should create a group as ADMIN', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/groups')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Created Group',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: 'Created Group',
      }),
    );
  });

  it('should update a group as ADMIN', async () => {
    const group = await groupsRepository.save(
      groupsRepository.create({
        name: 'Group Before Update',
      }),
    );

    const response = await request(app.getHttpServer())
      .patch(`/api/groups/${group.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Group After Update',
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: group.id,
        name: 'Group After Update',
      }),
    );
  });

  it('should delete a group as ADMIN', async () => {
    const group = await groupsRepository.save(
      groupsRepository.create({
        name: 'Group To Delete',
      }),
    );

    await request(app.getHttpServer())
      .delete(`/api/groups/${group.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const deletedGroup = await groupsRepository.findOneBy({
      id: group.id,
    });

    expect(deletedGroup).toBeNull();
  });
});
