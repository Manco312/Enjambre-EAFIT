import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { MemberStatusesService } from '../../../src/groups/member-statuses.service.js';
import { MemberStatus } from '../../../src/groups/entities/member-status.entity.js';
import { GroupsService } from '../../../src/groups/groups.service.js';
import { Group } from '../../../src/groups/entities/group.entity.js';

describe('MemberStatusesService', () => {
  let service: MemberStatusesService;
  let repository: Repository<MemberStatus>;
  let groupsService: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberStatusesService,
        {
          provide: getRepositoryToken(MemberStatus),
          useValue: {
            find: vi.fn(),
            findOneBy: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            preload: vi.fn(),
            delete: vi.fn(),
          },
        },
        {
          provide: GroupsService,
          useValue: {
            findById: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MemberStatusesService>(MemberStatusesService);
    repository = module.get<Repository<MemberStatus>>(
      getRepositoryToken(MemberStatus),
    );
    groupsService = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByGroup', () => {
    it('should return the statuses of a group', async () => {
      const statuses = [{ id: 1, name: 'ACTIVO' }] as MemberStatus[];

      vi.spyOn(repository, 'find').mockResolvedValue(statuses);

      const result = await service.findByGroup(1);

      expect(repository.find).toHaveBeenCalledWith({
        where: { group: { id: 1 } },
      });
      expect(result).toBe(statuses);
    });
  });

  describe('findById', () => {
    it('should return a status when it exists', async () => {
      const status = { id: 1, name: 'ACTIVO' } as MemberStatus;

      vi.spyOn(repository, 'findOneBy').mockResolvedValue(status);

      const result = await service.findById(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe(status);
    });

    it('should throw NotFoundException when the status does not exist', async () => {
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        'MemberStatus with id 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a status linked to its group', async () => {
      const dto = { name: 'ACTIVO', groupId: 1, target: 70 };
      const group = { id: 1, name: 'SPIE' } as Group;
      const status = {
        id: 1,
        name: 'ACTIVO',
        target: 70,
        group,
      } as MemberStatus;

      vi.spyOn(groupsService, 'findById').mockResolvedValue(group);
      vi.spyOn(repository, 'create').mockReturnValue(status);
      vi.spyOn(repository, 'save').mockResolvedValue(status);

      const result = await service.create(dto);

      expect(groupsService.findById).toHaveBeenCalledWith(1);
      expect(repository.create).toHaveBeenCalledWith({
        name: 'ACTIVO',
        target: 70,
        group,
      });
      expect(repository.save).toHaveBeenCalledWith(status);
      expect(result).toBe(status);
    });
  });

  describe('update', () => {
    it('should update the scalar fields of a status', async () => {
      const status = { id: 1, name: 'ACTIVO', target: 90 } as MemberStatus;

      vi.spyOn(repository, 'preload').mockResolvedValue(status);
      vi.spyOn(repository, 'save').mockResolvedValue(status);

      const result = await service.update(1, { target: 90 });

      expect(repository.preload).toHaveBeenCalledWith({ id: 1, target: 90 });
      expect(groupsService.findById).not.toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(status);
      expect(result).toBe(status);
    });

    it('should reassign the group when groupId is provided', async () => {
      const status = { id: 1, name: 'ACTIVO', target: 70 } as MemberStatus;
      const group = { id: 2, name: 'OE' } as Group;

      vi.spyOn(repository, 'preload').mockResolvedValue(status);
      vi.spyOn(groupsService, 'findById').mockResolvedValue(group);
      vi.spyOn(repository, 'save').mockResolvedValue(status);

      await service.update(1, { groupId: 2 });

      expect(repository.preload).toHaveBeenCalledWith({ id: 1 });
      expect(groupsService.findById).toHaveBeenCalledWith(2);
      expect(status.group).toBe(group);
    });

    it('should throw NotFoundException when the status does not exist', async () => {
      vi.spyOn(repository, 'preload').mockResolvedValue(undefined);

      await expect(service.update(999, { target: 50 })).rejects.toThrow(
        'MemberStatus with id 999 not found',
      );

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a status', async () => {
      const deleteResult = { affected: 1, raw: {} } as DeleteResult;

      vi.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(deleteResult);
    });
  });
});
