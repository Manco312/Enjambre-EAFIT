import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';

import { MembersService } from '../../../src/members/members.service.js';
import { Member } from '../../../src/members/entities/member.entity.js';
import { Permanence } from '../../../src/permanences/entities/permanence.entity.js';
import { CommitteesService } from '../../../src/committees/committees.service.js';
import { GroupMembersService } from '../../../src/groups/group-members.service.js';
import { MemberStatusesService } from '../../../src/groups/member-statuses.service.js';
import { Committee } from '../../../src/committees/entities/committee.entity.js';
import { GroupMember } from '../../../src/groups/entities/group-member.entity.js';
import { MemberStatus } from '../../../src/groups/entities/member-status.entity.js';

describe('MembersService', () => {
  let service: MembersService;
  let repository: Repository<Member>;
  let permanencesRepository: Repository<Permanence>;
  let committeesService: CommitteesService;
  let groupMembersService: GroupMembersService;
  let memberStatusesService: MemberStatusesService;

  const baseMemberDto = {
    idEpik: 1001,
    fullName: 'Juan Pérez',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '100000001',
    email: 'juan@example.com',
    phone: '3000000001',
    program: 'Ingeniería de Sistemas',
    secondProgram: '',
  };

  const createDto = {
    ...baseMemberDto,
    committeeIds: [3],
    groupId: 2,
    memberStatusId: 5,
  };

  const statusOfGroup2 = { id: 5, groupId: 2 } as MemberStatus;
  const committeeOfGroup2 = {
    id: 3,
    name: 'DIVULGACIÓN',
    groupId: 2,
  } as Committee;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: getRepositoryToken(Member),
          useValue: {
            find: vi.fn().mockResolvedValue([]),
            findOne: vi.fn(),
            findOneBy: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            preload: vi.fn(),
            delete: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Permanence),
          useValue: {
            find: vi.fn().mockResolvedValue([]),
            delete: vi.fn(),
          },
        },
        {
          provide: CommitteesService,
          useValue: {
            findById: vi.fn(),
          },
        },
        {
          provide: GroupMembersService,
          useValue: {
            create: vi.fn(),
            remove: vi.fn(),
            findByMember: vi.fn().mockResolvedValue([]),
            findByMemberAndGroup: vi.fn(),
          },
        },
        {
          provide: MemberStatusesService,
          useValue: {
            findById: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    repository = module.get<Repository<Member>>(getRepositoryToken(Member));
    permanencesRepository = module.get<Repository<Permanence>>(
      getRepositoryToken(Permanence),
    );
    committeesService = module.get<CommitteesService>(CommitteesService);
    groupMembersService = module.get<GroupMembersService>(GroupMembersService);
    memberStatusesService = module.get<MemberStatusesService>(
      MemberStatusesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByGroup', () => {
    it('should filter members by their group membership', async () => {
      const members = [{ id: 1, fullName: 'Juan Pérez' }] as Member[];

      vi.spyOn(repository, 'find').mockResolvedValue(members);

      const result = await service.findByGroup(2);

      expect(repository.find).toHaveBeenCalledWith({
        where: { groupMembers: { group: { id: 2 } } },
      });
      expect(result).toBe(members);
    });
  });

  describe('findById', () => {
    it('should return a member when it exists', async () => {
      const member = { id: 1, fullName: 'Juan Pérez' } as Member;

      vi.spyOn(repository, 'findOneBy').mockResolvedValue(member);

      const result = await service.findById(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe(member);
    });

    it('should throw NotFoundException when the member does not exist', async () => {
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        'Member with id 999 not found',
      );
    });
  });

  describe('create', () => {
    beforeEach(() => {
      vi.spyOn(memberStatusesService, 'findById').mockResolvedValue(
        statusOfGroup2,
      );
      vi.spyOn(committeesService, 'findById').mockResolvedValue(
        committeeOfGroup2,
      );
    });

    it('should create the member, link its committees and create the group membership', async () => {
      const member = { id: 1, ...baseMemberDto } as Member;

      vi.spyOn(repository, 'create').mockReturnValue(member);
      vi.spyOn(repository, 'save').mockResolvedValue(member);

      const result = await service.create(createDto);

      expect(memberStatusesService.findById).toHaveBeenCalledWith(5);
      expect(committeesService.findById).toHaveBeenCalledWith(3);
      expect(repository.create).toHaveBeenCalledWith({
        ...baseMemberDto,
        committees: [committeeOfGroup2],
      });
      expect(repository.save).toHaveBeenCalledWith(member);
      expect(groupMembersService.create).toHaveBeenCalledWith({
        memberId: 1,
        groupId: 2,
        memberStatusId: 5,
      });
      expect(result).toBe(member);
    });

    it('should name the repeated fields when another member already uses them', async () => {
      const existing = {
        id: 9,
        idEpik: 2002,
        documentNumber: '999',
        email: 'JUAN@EXAMPLE.COM',
        phone: '3000000001',
      } as Member;

      vi.spyOn(repository, 'find').mockResolvedValue([existing]);

      await expect(service.create(createDto)).rejects.toThrow(
        'Ya existe otro integrante con el mismo correo electrónico, celular.',
      );

      expect(repository.save).not.toHaveBeenCalled();
      expect(groupMembersService.create).not.toHaveBeenCalled();
    });

    it('should link the existing member to the new group when it is the same person', async () => {
      const otherCommittee = { id: 8, groupId: 1 } as Committee;
      const existing = {
        id: 9,
        ...baseMemberDto,
        committees: [otherCommittee],
      } as Member;

      vi.spyOn(repository, 'find').mockResolvedValue([existing]);
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(existing);

      const result = await service.create(createDto);

      expect(repository.create).not.toHaveBeenCalled();
      expect(groupMembersService.create).toHaveBeenCalledWith({
        memberId: 9,
        groupId: 2,
        memberStatusId: 5,
      });
      expect(existing.committees).toEqual([otherCommittee, committeeOfGroup2]);
      expect(repository.save).toHaveBeenCalledWith(existing);
      expect(result).toBe(existing);
    });

    it('should reject a status that belongs to another group', async () => {
      vi.spyOn(memberStatusesService, 'findById').mockResolvedValue({
        id: 5,
        groupId: 7,
      } as MemberStatus);

      await expect(service.create(createDto)).rejects.toThrow(
        'El estado de miembro seleccionado no pertenece a este grupo.',
      );

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should reject a committee that belongs to another group', async () => {
      vi.spyOn(committeesService, 'findById').mockResolvedValue({
        id: 3,
        name: 'AJENO',
        groupId: 7,
      } as Committee);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should not leave a member without group when the membership fails', async () => {
      const member = { id: 1, ...baseMemberDto } as Member;

      vi.spyOn(repository, 'create').mockReturnValue(member);
      vi.spyOn(repository, 'save').mockResolvedValue(member);
      vi.spyOn(groupMembersService, 'create').mockRejectedValue(
        new Error('boom'),
      );

      await expect(service.create(createDto)).rejects.toThrow('boom');

      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    const current = {
      id: 1,
      fullName: 'Juan Pérez',
      committees: [committeeOfGroup2],
    } as Member;

    beforeEach(() => {
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(current);
    });

    it('should update the scalar fields of a member', async () => {
      const member = { id: 1, fullName: 'Nuevo Nombre' } as Member;

      vi.spyOn(repository, 'preload').mockResolvedValue(member);
      vi.spyOn(repository, 'save').mockResolvedValue(member);

      const result = await service.update(1, { fullName: 'Nuevo Nombre' });

      expect(repository.preload).toHaveBeenCalledWith({
        id: 1,
        fullName: 'Nuevo Nombre',
      });
      expect(committeesService.findById).not.toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(member);
      // Devuelve el miembro recién leído, con los valores normalizados.
      expect(result).toBe(current);
    });

    it('should reject a unique field that another member already uses', async () => {
      vi.spyOn(repository, 'find').mockResolvedValue([
        { id: 2, idEpik: 1002 } as Member,
      ]);

      await expect(service.update(1, { idEpik: 1002 })).rejects.toThrow(
        'Ya existe otro integrante con el mismo ID EPIK.',
      );

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should ignore the member itself when checking unique fields', async () => {
      const member = { id: 1, idEpik: 1001 } as Member;

      vi.spyOn(repository, 'find').mockResolvedValue([member]);
      vi.spyOn(repository, 'preload').mockResolvedValue(member);

      await expect(service.update(1, { idEpik: 1001 })).resolves.toBe(current);
    });

    it('should replace only the committees of the given group and drop their scores', async () => {
      const member = { id: 1 } as Member;
      const committeeOfGroup1 = { id: 8, groupId: 1 } as Committee;
      const nextCommittee = {
        id: 4,
        name: 'PUBLICIDAD',
        groupId: 2,
      } as Committee;

      vi.spyOn(repository, 'findOneBy').mockResolvedValue({
        id: 1,
        committees: [committeeOfGroup1, committeeOfGroup2],
      } as Member);
      vi.spyOn(repository, 'preload').mockResolvedValue(member);
      vi.spyOn(groupMembersService, 'findByMember').mockResolvedValue([
        { groupId: 1 },
        { groupId: 2 },
      ] as GroupMember[]);
      vi.spyOn(committeesService, 'findById').mockResolvedValue(nextCommittee);
      vi.spyOn(permanencesRepository, 'find').mockResolvedValue([
        { id: 70 },
        { id: 71 },
      ] as Permanence[]);

      await service.update(1, { committeeIds: [4], groupId: 2 });

      expect(committeesService.findById).toHaveBeenCalledWith(4);
      expect(member.committees).toEqual([committeeOfGroup1, nextCommittee]);
      // Salió del comité 3: se borran sus puntajes en ese comité.
      expect(permanencesRepository.delete).toHaveBeenCalledWith([70, 71]);
    });

    it('should reject committees from a group the member is not in', async () => {
      vi.spyOn(repository, 'preload').mockResolvedValue({ id: 1 } as Member);
      vi.spyOn(groupMembersService, 'findByMember').mockResolvedValue([
        { groupId: 2 },
      ] as GroupMember[]);
      vi.spyOn(committeesService, 'findById').mockResolvedValue({
        id: 8,
        name: 'AJENO',
        groupId: 1,
      } as Committee);

      await expect(service.update(1, { committeeIds: [8] })).rejects.toThrow(
        BadRequestException,
      );

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the member does not exist', async () => {
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.update(999, { fullName: 'Nuevo Nombre' }),
      ).rejects.toThrow('Member with id 999 not found');

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const deleteResult = { affected: 1, raw: {} } as DeleteResult;

    it('should delete a member from every group when no group is given', async () => {
      vi.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(deleteResult);
    });

    it('should delete the member when the given group is its only one', async () => {
      const membership = { id: 30, groupId: 2 } as GroupMember;

      vi.spyOn(groupMembersService, 'findByMemberAndGroup').mockResolvedValue(
        membership,
      );
      vi.spyOn(groupMembersService, 'findByMember').mockResolvedValue([
        membership,
      ]);
      vi.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.remove(1, 2);

      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(groupMembersService.remove).not.toHaveBeenCalled();
      expect(result).toBe(deleteResult);
    });

    it('should only unlink the member when it also belongs to other groups', async () => {
      const membership = { id: 30, groupId: 2 } as GroupMember;
      const committeeOfGroup1 = { id: 8, groupId: 1 } as Committee;
      const member = {
        id: 1,
        committees: [committeeOfGroup1, committeeOfGroup2],
      } as Member;

      vi.spyOn(groupMembersService, 'findByMemberAndGroup').mockResolvedValue(
        membership,
      );
      vi.spyOn(groupMembersService, 'findByMember').mockResolvedValue([
        { id: 29, groupId: 1 } as GroupMember,
        membership,
      ]);
      vi.spyOn(groupMembersService, 'remove').mockResolvedValue(deleteResult);
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(member);
      vi.spyOn(permanencesRepository, 'find').mockResolvedValue([
        { id: 70 },
      ] as Permanence[]);

      const result = await service.remove(1, 2);

      expect(repository.delete).not.toHaveBeenCalled();
      expect(member.committees).toEqual([committeeOfGroup1]);
      expect(permanencesRepository.delete).toHaveBeenCalledWith([70]);
      expect(groupMembersService.remove).toHaveBeenCalledWith(30);
      expect(result).toBe(deleteResult);
    });

    it('should throw when the member is not in the given group', async () => {
      vi.spyOn(groupMembersService, 'findByMemberAndGroup').mockResolvedValue(
        null,
      );

      await expect(service.remove(1, 2)).rejects.toThrow(
        'El integrante no pertenece a este grupo.',
      );

      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  it('should report conflicts as ConflictException', async () => {
    vi.spyOn(memberStatusesService, 'findById').mockResolvedValue(
      statusOfGroup2,
    );
    vi.spyOn(committeesService, 'findById').mockResolvedValue(
      committeeOfGroup2,
    );
    vi.spyOn(repository, 'find').mockResolvedValue([
      { id: 9, idEpik: 1001, documentNumber: 'OTRO' } as Member,
    ]);

    await expect(service.create(createDto)).rejects.toThrow(ConflictException);
  });
});
