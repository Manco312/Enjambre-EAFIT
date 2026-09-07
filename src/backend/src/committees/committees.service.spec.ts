import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { CommitteesService } from './committees.service.js';
import { Committee } from './entities/committee.entity.js';
import { GroupsService } from '../groups/groups.service.js';
import { Group } from '../groups/entities/group.entity.js';

describe('CommitteesService', () => {
  let service: CommitteesService;
  let repository: Repository<Committee>;
  let groupsService: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommitteesService,
        {
          provide: getRepositoryToken(Committee),
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

    service = module.get<CommitteesService>(CommitteesService);
    repository = module.get<Repository<Committee>>(
      getRepositoryToken(Committee),
    );
    groupsService = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByGroup', () => {
    it('should return the committees of a group', async () => {
      const committees = [{ id: 1, name: 'DIVULGACIÓN' }] as Committee[];

      vi.spyOn(repository, 'find').mockResolvedValue(committees);

      const result = await service.findByGroup(1);

      expect(repository.find).toHaveBeenCalledWith({
        where: { group: { id: 1 } },
      });
      expect(result).toBe(committees);
    });
  });

  describe('findById', () => {
    it('should return a committee when it exists', async () => {
      const committee = { id: 1, name: 'DIVULGACIÓN' } as Committee;

      vi.spyOn(repository, 'findOneBy').mockResolvedValue(committee);

      const result = await service.findById(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe(committee);
    });

    it('should throw NotFoundException when the committee does not exist', async () => {
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        'Committee with id 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a committee linked to its group', async () => {
      const dto = { name: 'DIVULGACIÓN', groupId: 1 };
      const group = { id: 1, name: 'SPIE' } as Group;
      const committee = { id: 1, name: 'DIVULGACIÓN', group } as Committee;

      vi.spyOn(groupsService, 'findById').mockResolvedValue(group);
      vi.spyOn(repository, 'create').mockReturnValue(committee);
      vi.spyOn(repository, 'save').mockResolvedValue(committee);

      const result = await service.create(dto);

      expect(groupsService.findById).toHaveBeenCalledWith(1);
      expect(repository.create).toHaveBeenCalledWith({
        name: 'DIVULGACIÓN',
        group,
      });
      expect(repository.save).toHaveBeenCalledWith(committee);
      expect(result).toBe(committee);
    });
  });

  describe('update', () => {
    it('should update the name of a committee', async () => {
      const committee = { id: 1, name: 'New name' } as Committee;

      vi.spyOn(repository, 'preload').mockResolvedValue(committee);
      vi.spyOn(repository, 'save').mockResolvedValue(committee);

      const result = await service.update(1, { name: 'New name' });

      expect(repository.preload).toHaveBeenCalledWith({
        id: 1,
        name: 'New name',
      });
      expect(groupsService.findById).not.toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(committee);
      expect(result).toBe(committee);
    });

    it('should reassign the group when groupId is provided', async () => {
      const committee = { id: 1, name: 'DIVULGACIÓN' } as Committee;
      const group = { id: 2, name: 'OE' } as Group;

      vi.spyOn(repository, 'preload').mockResolvedValue(committee);
      vi.spyOn(groupsService, 'findById').mockResolvedValue(group);
      vi.spyOn(repository, 'save').mockResolvedValue(committee);

      await service.update(1, { groupId: 2 });

      expect(repository.preload).toHaveBeenCalledWith({ id: 1 });
      expect(groupsService.findById).toHaveBeenCalledWith(2);
      expect(committee.group).toBe(group);
    });

    it('should throw NotFoundException when the committee does not exist', async () => {
      vi.spyOn(repository, 'preload').mockResolvedValue(undefined);

      await expect(service.update(999, { name: 'New name' })).rejects.toThrow(
        'Committee with id 999 not found',
      );

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a committee', async () => {
      const deleteResult = { affected: 1, raw: {} } as DeleteResult;

      vi.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(deleteResult);
    });
  });
});
