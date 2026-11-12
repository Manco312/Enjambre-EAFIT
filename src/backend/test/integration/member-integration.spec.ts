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

describe('Members integration', () => {
  let app: INestApplication;

  let usersService: UsersService;
  let groupsRepository: Repository<Group>;
  let membersRepository: Repository<Member>;
  let memberStatusesRepository: Repository<MemberStatus>;

  let token: string;
  let group: Group;
  let memberStatus: MemberStatus;
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

    groupsRepository = module.get<Repository<Group>>(getRepositoryToken(Group));

    membersRepository = module.get<Repository<Member>>(
      getRepositoryToken(Member),
    );

    memberStatusesRepository = module.get<Repository<MemberStatus>>(
      getRepositoryToken(MemberStatus),
    );

    await app.init();

    group = await groupsRepository.save(
      groupsRepository.create({
        name: 'Test Group',
      }),
    );

    memberStatus = await memberStatusesRepository.save(
      memberStatusesRepository.create({
        name: 'Active',
        target: 100,
        group,
      }),
    );

    await usersService.create({
      username: 'john',
      password: 'password123',
      groupId: group.id,
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'john',
        password: 'password123',
      })
      .expect(200);

    token = loginResponse.body.access_token;

    member = await membersRepository.save(
      membersRepository.create({
        idEpik: 1001,
        fullName: 'John Doe',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '1000000001',
        email: 'john.doe@test.com',
        phone: '3000000001',
        program: 'Software Engineering',
        secondProgram: 'Computer Science',
      }),
    );
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should list members', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/members')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: member.id,
          idEpik: 1001,
          fullName: 'JOHN DOE',
          email: 'JOHN.DOE@TEST.COM',
        }),
      ]),
    );
  });

  it('should return a member by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/members/${member.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: member.id,
        idEpik: 1001,
        fullName: 'JOHN DOE',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '1000000001',
        email: 'JOHN.DOE@TEST.COM',
        phone: '3000000001',
        program: 'Software Engineering',
      }),
    );
  });

  it('should list members by group', async () => {
    // Link the member to the group.
    await request(app.getHttpServer())
      .post('/api/group-members')
      .set('Authorization', `Bearer ${token}`)
      .send({
        memberId: member.id,
        groupId: group.id,
        memberStatusId: memberStatus.id,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/api/members?groupId=${group.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: member.id,
          idEpik: 1001,
        }),
      ]),
    );
  });

  it('should create a member', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/members')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idEpik: 1002,
        fullName: 'Jane Smith',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '1000000002',
        email: 'jane.smith@test.com',
        phone: '3000000002',
        program: 'Computer Science',
        secondProgram: 'Software Engineering',
        groupId: group.id,
        memberStatusId: memberStatus.id,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        idEpik: 1002,
        fullName: 'Jane Smith',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '1000000002',
        email: 'jane.smith@test.com',
        phone: '3000000002',
        program: 'Computer Science',
      }),
    );
  });

  describe('validation', () => {
    const validPayload = () => ({
      idEpik: 1500,
      fullName: 'Valid Person',
      documentType: 'Cédula de ciudadanía',
      documentNumber: '1000001500',
      email: 'valid.person@test.com',
      phone: '3000001500',
      program: 'Computer Science',
      groupId: group.id,
      memberStatusId: memberStatus.id,
    });

    const post = (payload: Record<string, unknown>) =>
      request(app.getHttpServer())
        .post('/api/members')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

    it.each([
      ['an idEpik of 0', { idEpik: 0 }],
      ['a negative idEpik', { idEpik: -5 }],
      ['a decimal idEpik', { idEpik: 10.5 }],
      ['an email without @', { email: 'not-an-email' }],
      ['a phone with letters', { phone: '300abc0001' }],
      ['a whitespace-only name', { fullName: '   ' }],
      ['a whitespace-only program', { program: '   ' }],
      ['an unknown document type', { documentType: 'CC' }],
      ['a document number with dots', { documentNumber: '1.000.001' }],
      ['a name longer than 255 characters', { fullName: 'x'.repeat(256) }],
    ])('should reject %s', async (_label, override) => {
      await post({ ...validPayload(), ...override }).expect(400);
    });

    it('should explain which field is duplicated', async () => {
      const response = await post({
        ...validPayload(),
        email: 'JOHN.DOE@test.com',
      }).expect(409);

      expect(response.body.message).toBe(
        'Ya existe otro integrante con el mismo correo electrónico.',
      );
    });

    it('should reject a status from another group without leaving an orphan member', async () => {
      const otherGroup = await groupsRepository.save(
        groupsRepository.create({ name: 'Other Members Group' }),
      );
      const foreignStatus = await memberStatusesRepository.save(
        memberStatusesRepository.create({
          name: 'Foreign',
          target: 10,
          group: otherGroup,
        }),
      );

      await post({
        ...validPayload(),
        memberStatusId: foreignStatus.id,
      }).expect(400);

      expect(await membersRepository.findOneBy({ idEpik: 1500 })).toBeNull();
    });

    it('should reject a duplicated field when updating', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/members/${member.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ idEpik: 1002 })
        .expect(409);

      expect(response.body.message).toBe(
        'Ya existe otro integrante con el mismo ID EPIK.',
      );
    });

    it('should link the same person to a second group instead of duplicating it', async () => {
      const secondGroup = await groupsRepository.save(
        groupsRepository.create({ name: 'Second Members Group' }),
      );
      const secondStatus = await memberStatusesRepository.save(
        memberStatusesRepository.create({
          name: 'Active',
          target: 50,
          group: secondGroup,
        }),
      );

      const response = await post({
        idEpik: 1002,
        fullName: 'Jane Smith',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '1000000002',
        email: 'jane.smith@test.com',
        phone: '3000000002',
        program: 'Computer Science',
        groupId: secondGroup.id,
        memberStatusId: secondStatus.id,
      }).expect(201);

      const listed = await request(app.getHttpServer())
        .get(`/api/members?groupId=${secondGroup.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(listed.body.map((item: { id: number }) => item.id)).toEqual([
        response.body.id,
      ]);
      expect(await membersRepository.countBy({ idEpik: 1002 })).toBe(1);

      // Sacarla del segundo grupo no la borra del primero.
      await request(app.getHttpServer())
        .delete(`/api/members/${response.body.id}?groupId=${secondGroup.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(await membersRepository.countBy({ idEpik: 1002 })).toBe(1);

      const afterRemoval = await request(app.getHttpServer())
        .get(`/api/members?groupId=${secondGroup.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(afterRemoval.body).toEqual([]);
    });
  });

  it('should update a member', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/members/${member.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'John Updated',
        program: 'Systems Engineering',
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: member.id,
        // Se devuelve el valor ya normalizado (el nombre se guarda en mayúscula).
        fullName: 'JOHN UPDATED',
      }),
    );
  });

  it('should delete a member', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/members/${member.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        affected: 1,
      }),
    );

    await request(app.getHttpServer())
      .get(`/api/members/${member.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
