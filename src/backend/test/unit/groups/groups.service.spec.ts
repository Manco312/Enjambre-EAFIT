import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { GroupsService } from '../../../src/groups/groups.service.js'; 
import { Group } from '../../../src/groups/entities/group.entity.js'; 
import { GroupMember } from '../../../src/groups/entities/group-member.entity.js'; 
import { Member } from '../../../src/members/entities/member.entity.js';

describe('GroupsService', () => {
  let service: GroupsService;
  let repository: Repository<Group>;
  let transactionManager: {
    find: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    transactionManager = { find: vi.fn(), count: vi.fn(), delete: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: getRepositoryToken(Group),
          useValue: {
            find: vi.fn(),
            findOneBy: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            preload: vi.fn(),
            delete: vi.fn(),
            manager: {
              transaction: vi.fn(
                async (cb: (m: typeof transactionManager) => unknown) =>
                  cb(transactionManager),
              ),
            },
          },
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    repository = module.get<Repository<Group>>(getRepositoryToken(Group));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return every group', async () => {
      const groups = [{ id: 1, name: 'SPIE' }] as Group[];

      vi.spyOn(repository, 'find').mockResolvedValue(groups);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith();
      expect(result).toBe(groups);
    });
  });

  describe('findById', () => {
    it('should return a group when it exists', async () => {
      const group = { id: 1, name: 'SPIE' } as Group;

      vi.spyOn(repository, 'findOneBy').mockResolvedValue(group);

      const result = await service.findById(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe(group);
    });

    it('should throw NotFoundException when the group does not exist', async () => {
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        'Group with id 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create and save a group', async () => {
      const dto = { name: 'SPIE' };
      const group = { id: 1, name: 'SPIE' } as Group;

      vi.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      vi.spyOn(repository, 'create').mockReturnValue(group);
      vi.spyOn(repository, 'save').mockResolvedValue(group);

      const result = await service.create(dto);

      expect(repository.findOneBy).toHaveBeenCalledWith({ name: 'SPIE' });
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(group);
      expect(result).toBe(group);
    });

    it('should throw ConflictException when the name is already taken', async () => {
      const existingGroup = { id: 1, name: 'SPIE' } as Group;

      vi.spyOn(repository, 'findOneBy').mockResolvedValue(existingGroup);

      await expect(service.create({ name: 'SPIE' })).rejects.toThrow(
        'Group with name SPIE already exists',
      );

      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing group', async () => {
      const group = { id: 1, name: 'New name' } as Group;

      vi.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      vi.spyOn(repository, 'preload').mockResolvedValue(group);
      vi.spyOn(repository, 'save').mockResolvedValue(group);

      const result = await service.update(1, { name: 'New name' });

      expect(repository.preload).toHaveBeenCalledWith({
        id: 1,
        name: 'New name',
      });
      expect(repository.save).toHaveBeenCalledWith(group);
      expect(result).toBe(group);
    });

    it('should throw ConflictException when the new name belongs to another group', async () => {
      const otherGroup = { id: 2, name: 'New name' } as Group;

      vi.spyOn(repository, 'findOneBy').mockResolvedValue(otherGroup);

      await expect(service.update(1, { name: 'New name' })).rejects.toThrow(
        'Group with name New name already exists',
      );

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating a non-existing group', async () => {
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      vi.spyOn(repository, 'preload').mockResolvedValue(undefined);

      await expect(service.update(999, { name: 'New name' })).rejects.toThrow(
        'Group with id 999 not found',
      );

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete the group, its group_members and only the orphan members', async () => {
      const deleteResult = { affected: 1, raw: [] } as DeleteResult;

      transactionManager.find.mockResolvedValue([
        { member: { id: 10 } }, // queda sin grupos -> se borra
        { member: { id: 20 } }, // sigue en otro grupo -> se conserva
      ]);
      transactionManager.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(1);
      transactionManager.delete.mockResolvedValue(deleteResult);

      const result = await service.remove(1);

      expect(transactionManager.delete).toHaveBeenCalledWith(GroupMember, {
        group: { id: 1 },
      });
      expect(transactionManager.delete).toHaveBeenCalledWith(Member, 10);
      expect(transactionManager.delete).not.toHaveBeenCalledWith(Member, 20);
      expect(transactionManager.delete).toHaveBeenLastCalledWith(Group, 1);
      expect(result).toBe(deleteResult);
    });
  });
});
