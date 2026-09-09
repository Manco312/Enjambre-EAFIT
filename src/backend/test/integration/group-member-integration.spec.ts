import 'dotenv/config';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TestAppModule } from './test-app.module.js';
import { Group } from '../../src/groups/entities/group.entity.js';
import { Member } from '../../src/members/entities/member.entity.js';
import { MemberStatus } from '../../src/groups/entities/member-status.entity.js';
import { UsersService } from '../../src/users/users.service.js';

describe('Group members integration', () => {
  let app: INestApplication;

  let usersService: UsersService;
  let groupsRepository: Repository<Group>;
  let membersRepository: Repository<Member>;
  let memberStatusesRepository: Repository<MemberStatus>;

  let token: string;
  let group: Group;
  let memberStatus: MemberStatus;
  let secondMemberStatus: MemberStatus;
  let member: Member;

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

    memberStatusesRepository = module.get<Repository<MemberStatus>>(
      getRepositoryToken(MemberStatus),
    );

    await app.init();

    group = await groupsRepository.save(
      groupsRepository.create({
        name: 'Group Members Test Group',
      }),
    );

    memberStatus = await memberStatusesRepository.save(
      memberStatusesRepository.create({
        name: 'Active',
        target: 100,
        group,
      }),
    );

    secondMemberStatus = await memberStatusesRepository.save(
      memberStatusesRepository.create({
        name: 'Inactive',
        target: 0,
        group,
      }),
    );

    member = await membersRepository.save(
      membersRepository.create({
        idEpik: 2001,
        fullName: 'Group Member Test',
        documentType: 'CC',
        documentNumber: '2000000001',
        email: 'group.member@test.com',
        phone: '3100000001',
        program: 'Software Engineering',
      }),
    );

    await usersService.create({
      username: 'group-members.user',
      password: 'password123',
      groupId: group.id,
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'group-members.user',
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

  it('should create a group member', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/group-members')
      .set('Authorization', `Bearer ${token}`)
      .send({
        memberId: member.id,
        groupId: group.id,
        memberStatusId: memberStatus.id,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        memberId: member.id,
        groupId: group.id,
        memberStatusId: memberStatus.id,
      }),
    );
  });

  it('should list group members', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/group-members')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          memberId: member.id,
          groupId: group.id,
        }),
      ]),
    );
  });

  it('should return a group member by id', async () => {
    const list = await request(app.getHttpServer())
      .get(`/api/group-members?memberId=${member.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const groupMemberId = list.body[0].id;

    const response = await request(app.getHttpServer())
      .get(`/api/group-members/${groupMemberId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: groupMemberId,
        memberId: member.id,
        groupId: group.id,
      }),
    );
  });

  it('should list group members by group', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/group-members?groupId=${group.id}`)
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

  it('should list group members by member', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/group-members?memberId=${member.id}`)
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

  it('should update a group member status', async () => {
    const list = await request(app.getHttpServer())
      .get(`/api/group-members?memberId=${member.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const groupMemberId = list.body[0].id;

    const response = await request(app.getHttpServer())
      .patch(`/api/group-members/${groupMemberId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        memberStatusId: secondMemberStatus.id,
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: groupMemberId,
        memberStatusId: secondMemberStatus.id,
      }),
    );
  });

  it('should delete a group member', async () => {
    const list = await request(app.getHttpServer())
      .get(`/api/group-members?memberId=${member.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const groupMemberId = list.body[0].id;

    await request(app.getHttpServer())
      .delete(`/api/group-members/${groupMemberId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/group-members/${groupMemberId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
