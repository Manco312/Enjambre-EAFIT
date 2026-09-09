import 'dotenv/config';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TestAppModule } from './test-app.module.js';
import { Group } from '../../src/groups/entities/group.entity.js';
import { Member } from '../../src/members/entities/member.entity.js';
import { Activity } from '../../src/activities/entities/activity.entity.js';
import { UsersService } from '../../src/users/users.service.js';

describe('Permanences integration', () => {
  let app: INestApplication;

  let usersService: UsersService;
  let groupsRepository: Repository<Group>;
  let membersRepository: Repository<Member>;
  let activitiesRepository: Repository<Activity>;

  let token: string;
  let group: Group;
  let member: Member;
  let secondMember: Member;
  let activity: Activity;

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

    membersRepository = module.get<Repository<Member>>(
      getRepositoryToken(Member),
    );

    activitiesRepository = module.get<Repository<Activity>>(
      getRepositoryToken(Activity),
    );

    await app.init();

    group = await groupsRepository.save(
      groupsRepository.create({
        name: 'Permanences Test Group',
      }),
    );

    activity = await activitiesRepository.save(
      activitiesRepository.create({
        name: 'Permanences Test Activity',
        description: 'Activity used to attach permanences',
        weight: 5,
        period: '2026-1',
        group,
        committee: null,
      }),
    );

    member = await membersRepository.save(
      membersRepository.create({
        idEpik: 3001,
        fullName: 'Permanence Member One',
        documentType: 'CC',
        documentNumber: '3000000001',
        email: 'permanence.one@test.com',
        phone: '3200000001',
        program: 'Software Engineering',
      }),
    );

    secondMember = await membersRepository.save(
      membersRepository.create({
        idEpik: 3002,
        fullName: 'Permanence Member Two',
        documentType: 'CC',
        documentNumber: '3000000002',
        email: 'permanence.two@test.com',
        phone: '3200000002',
        program: 'Software Engineering',
      }),
    );

    await usersService.create({
      username: 'permanences.user',
      password: 'password123',
      groupId: group.id,
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'permanences.user',
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

  it('should create a permanence', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/permanences')
      .set('Authorization', `Bearer ${token}`)
      .send({
        percentage: 80,
        memberId: member.id,
        activityId: activity.id,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        percentage: 80,
        memberId: member.id,
        activityId: activity.id,
      }),
    );
  });

  it('should list permanences', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/permanences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          memberId: member.id,
          activityId: activity.id,
        }),
      ]),
    );
  });

  it('should return a permanence by id', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/permanences')
      .set('Authorization', `Bearer ${token}`)
      .send({
        percentage: 50,
        memberId: secondMember.id,
        activityId: activity.id,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/api/permanences/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: created.body.id,
        percentage: 50,
      }),
    );
  });

  it('should list permanences by member', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/permanences?memberId=${member.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          memberId: member.id,
        }),
      ]),
    );
  });

  it('should list permanences by activity', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/permanences?activityId=${activity.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          activityId: activity.id,
        }),
      ]),
    );
  });

  it('should list permanences by group', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/permanences?groupId=${group.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          memberId: member.id,
        }),
      ]),
    );
  });

  it('should update a permanence', async () => {
    // A member/activity pair can only have one permanence (unique constraint),
    // so a fresh activity is used to avoid colliding with permanences created
    // by earlier tests in this file.
    const freshActivity = await activitiesRepository.save(
      activitiesRepository.create({
        name: 'Second Activity',
        description: 'Activity for the update test',
        weight: 3,
        period: '2026-1',
        group,
        committee: null,
      }),
    );

    const permanence = await request(app.getHttpServer())
      .post('/api/permanences')
      .set('Authorization', `Bearer ${token}`)
      .send({
        percentage: 30,
        memberId: member.id,
        activityId: freshActivity.id,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/api/permanences/${permanence.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        percentage: 60,
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: permanence.body.id,
        percentage: 60,
      }),
    );
  });

  it('should delete a permanence', async () => {
    const freshActivity = await activitiesRepository.save(
      activitiesRepository.create({
        name: 'Third Activity',
        description: 'Activity for the delete test',
        weight: 1,
        period: '2026-1',
        group,
        committee: null,
      }),
    );

    const permanence = await request(app.getHttpServer())
      .post('/api/permanences')
      .set('Authorization', `Bearer ${token}`)
      .send({
        percentage: 20,
        memberId: member.id,
        activityId: freshActivity.id,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/permanences/${permanence.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/permanences/${permanence.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
