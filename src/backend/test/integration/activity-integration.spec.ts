import 'dotenv/config';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TestAppModule } from './test-app.module.js';
import { Group } from '../../src/groups/entities/group.entity.js'; 
import { Committee } from '../../src/committees/entities/committee.entity.js'; 
import { UsersService } from '../../src/users/users.service.js'; 

describe('Activities integration', () => {
  let app: INestApplication;

  let usersService: UsersService;
  let groupsRepository: Repository<Group>;
  let committeesRepository: Repository<Committee>;

  let token: string;
  let group: Group;
  let committee: Committee;

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

    usersService = module.get<UsersService>(UsersService);

    groupsRepository = module.get<Repository<Group>>(
      getRepositoryToken(Group),
    );

    committeesRepository = module.get<Repository<Committee>>(
      getRepositoryToken(Committee),
    );

    await app.init();

    group = await groupsRepository.save(
      groupsRepository.create({
        name: 'Activities Test Group',
      }),
    );

    committee = await committeesRepository.save(
      committeesRepository.create({
        name: 'Activities Test Committee',
        group,
      }),
    );

    await usersService.create({
      username: 'activities.user',
      password: 'password123',
      groupId: group.id,
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'activities.user',
        password: 'password123',
      })
      .expect(200);

    token = loginResponse.body.access_token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should create an activity without a committee', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Weekly Meeting',
        description: 'General weekly meeting',
        weight: 5,
        groupId: group.id,
        committeeId: null,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: 'Weekly Meeting',
        weight: 5,
        groupId: group.id,
        committeeId: null,
        period: expect.stringMatching(/^\d{4}-[12]$/),
      }),
    );
  });

  it('should create an activity linked to a committee', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Committee Activity',
        description: 'Activity organized by a committee',
        weight: 10,
        groupId: group.id,
        committeeId: committee.id,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: 'Committee Activity',
        groupId: group.id,
        committeeId: committee.id,
      }),
    );
  });

  it('should list activities', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Weekly Meeting',
        }),
      ]),
    );
  });

  it('should return an activity by id', async () => {
    const activity = await request(app.getHttpServer())
      .post('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Activity By Id',
        description: 'Fetched by id',
        weight: 1,
        groupId: group.id,
        committeeId: null,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/api/activities/${activity.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: activity.body.id,
        name: 'Activity By Id',
      }),
    );
  });

  it('should list activities by group', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/activities?groupId=${group.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          groupId: group.id,
        }),
      ]),
    );
  });

  it('should list activities by committee', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/activities?committeeId=${committee.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          committeeId: committee.id,
        }),
      ]),
    );
  });

  it('should update an activity', async () => {
    const activity = await request(app.getHttpServer())
      .post('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Activity Before Update',
        description: 'Before update',
        weight: 2,
        groupId: group.id,
        committeeId: null,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/api/activities/${activity.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Activity After Update',
        weight: 8,
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: activity.body.id,
        name: 'Activity After Update',
        weight: 8,
      }),
    );
  });

  it('should delete an activity', async () => {
    const activity = await request(app.getHttpServer())
      .post('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Activity To Delete',
        description: 'To delete',
        weight: 1,
        groupId: group.id,
        committeeId: null,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/activities/${activity.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/activities/${activity.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
