import { Test, TestingModule } from '@nestjs/testing';
import { DeleteResult } from 'typeorm';

import { GroupsController } from './groups.controller.js';
import { GroupsService } from './groups.service.js';
import { Group } from './entities/group.entity.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';

describe('GroupsController', () => {
  let controller: GroupsController;
  let service: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: {
            findAll: vi.fn(),
            findById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
    service = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return every group', async () => {
      const groups = [{ id: 1, name: 'SPIE' }] as Group[];

      vi.spyOn(service, 'findAll').mockResolvedValue(groups);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(result).toBe(groups);
    });
  });

  describe('findById', () => {
    it('should return a group', async () => {
      const group = { id: 1, name: 'SPIE' } as Group;

      vi.spyOn(service, 'findById').mockResolvedValue(group);

      const result = await controller.findById(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toBe(group);
    });
  });

  describe('create', () => {
    it('should create and return a group', async () => {
      const dto: CreateGroupDto = { name: 'SPIE' };
      const group = { id: 1, name: 'SPIE' } as Group;

      vi.spyOn(service, 'create').mockResolvedValue(group);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(group);
    });
  });

  describe('update', () => {
    it('should update and return a group', async () => {
      const dto: UpdateGroupDto = { name: 'New name' };
      const group = { id: 1, name: 'New name' } as Group;

      vi.spyOn(service, 'update').mockResolvedValue(group);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(group);
    });
  });

  describe('remove', () => {
    it('should remove a group', async () => {
      const deleteResult = { affected: 1, raw: {} } as DeleteResult;

      vi.spyOn(service, 'remove').mockResolvedValue(deleteResult);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBe(deleteResult);
    });
  });
});
