import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { MembersService } from './members.service.js';
import { Member } from './entities/member.entity.js';
import { CommitteesService } from '../committees/committees.service.js';
import { GroupMembersService } from '../groups/group-members.service.js';
import { Committee } from '../committees/entities/committee.entity.js';

describe('MembersService', () => {
  let service: MembersService;
  let repository: Repository<Member>;
  let committeesService: CommitteesService;
  let groupMembersService: GroupMembersService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: getRepositoryToken(Member),
          useValue: {
            find: vi.fn(),
            findOne: vi.fn(),
            findOneBy: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            preload: vi.fn(),
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
          },
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    repository = module.get<Repository<Member>>(getRepositoryToken(Member));
    committeesService = module.get<CommitteesService>(CommitteesService);
    groupMembersService = module.get<GroupMembersService>(GroupMembersService);
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
    it('should create the member, link its committees and create the group membership', async () => {
      const dto = {
        ...baseMemberDto,
        committeeIds: [3],
        groupId: 2,
        memberStatusId: 5,
      };
      const committee = { id: 3, name: 'DIVULGACIÓN' } as Committee;
      const member = { id: 1, ...baseMemberDto } as Member;

      vi.spyOn(repository, 'findOne').mockResolvedValue(null);
      vi.spyOn(committeesService, 'findById').mockResolvedValue(committee);
      vi.spyOn(repository, 'create').mockReturnValue(member);
      vi.spyOn(repository, 'save').mockResolvedValue(member);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(baseMemberDto);
      expect(committeesService.findById).toHaveBeenCalledWith(3);
      expect(member.committees).toEqual([committee]);
      expect(repository.save).toHaveBeenCalledWith(member);
      expect(groupMembersService.create).toHaveBeenCalledWith({
        memberId: 1,
        groupId: 2,
        memberStatusId: 5,
      });
      expect(result).toBe(member);
    });

    it('should throw ConflictException when a unique field is already used', async () => {
      const existing = { id: 1 } as Member;

      vi.spyOn(repository, 'findOne').mockResolvedValue(existing);

      await expect(
        service.create({
          ...baseMemberDto,
          committeeIds: [],
          groupId: 2,
          memberStatusId: 5,
        }),
      ).rejects.toThrow(
        'A member with the same idEpik, email, document number or phone already exists',
      );

      expect(repository.save).not.toHaveBeenCalled();
      expect(groupMembersService.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
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
      expect(result).toBe(member);
    });

    it('should replace the committees when committeeIds is provided', async () => {
      const member = { id: 1, fullName: 'Juan Pérez' } as Member;
      const committee = { id: 4, name: 'PUBLICIDAD' } as Committee;

      vi.spyOn(repository, 'preload').mockResolvedValue(member);
      vi.spyOn(committeesService, 'findById').mockResolvedValue(committee);
      vi.spyOn(repository, 'save').mockResolvedValue(member);

      await service.update(1, { committeeIds: [4] });

      expect(committeesService.findById).toHaveBeenCalledWith(4);
      expect(member.committees).toEqual([committee]);
    });

    it('should throw NotFoundException when the member does not exist', async () => {
      vi.spyOn(repository, 'preload').mockResolvedValue(undefined);

      await expect(
        service.update(999, { fullName: 'Nuevo Nombre' }),
      ).rejects.toThrow('Member with id 999 not found');

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a member', async () => {
      const deleteResult = { affected: 1, raw: {} } as DeleteResult;

      vi.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(deleteResult);
    });
  });
});
