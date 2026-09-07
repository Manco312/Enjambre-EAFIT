import { Test, TestingModule } from '@nestjs/testing';
import { DeleteResult } from 'typeorm';

import { MemberStatusesController } from './member-statuses.controller.js';
import { MemberStatusesService } from './member-statuses.service.js';
import { MemberStatus } from './entities/member-status.entity.js';
import { CreateMemberStatusDto } from './dto/create-member-status.dto.js';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto.js';

describe('MemberStatusesController', () => {
  let controller: MemberStatusesController;
  let service: MemberStatusesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberStatusesController],
      providers: [
        {
          provide: MemberStatusesService,
          useValue: {
            findAll: vi.fn(),
            findByGroup: vi.fn(),
            findById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MemberStatusesController>(MemberStatusesController);
    service = module.get<MemberStatusesService>(MemberStatusesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return every status when no group filter is given', async () => {
      const statuses = [{ id: 1, name: 'ACTIVO' }] as MemberStatus[];

      vi.spyOn(service, 'findAll').mockResolvedValue(statuses);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(service.findByGroup).not.toHaveBeenCalled();
      expect(result).toBe(statuses);
    });

    it('should filter by group when groupId is given', async () => {
      const statuses = [{ id: 1, name: 'ACTIVO' }] as MemberStatus[];

      vi.spyOn(service, 'findByGroup').mockResolvedValue(statuses);

      const result = await controller.findAll(1);

      expect(service.findByGroup).toHaveBeenCalledWith(1);
      expect(service.findAll).not.toHaveBeenCalled();
      expect(result).toBe(statuses);
    });
  });

  describe('findById', () => {
    it('should return a status', async () => {
      const status = { id: 1, name: 'ACTIVO' } as MemberStatus;

      vi.spyOn(service, 'findById').mockResolvedValue(status);

      const result = await controller.findById(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toBe(status);
    });
  });

  describe('create', () => {
    it('should create and return a status', async () => {
      const dto: CreateMemberStatusDto = {
        name: 'ACTIVO',
        groupId: 1,
        target: 70,
      };
      const status = { id: 1, name: 'ACTIVO', target: 70 } as MemberStatus;

      vi.spyOn(service, 'create').mockResolvedValue(status);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(status);
    });
  });

  describe('update', () => {
    it('should update and return a status', async () => {
      const dto: UpdateMemberStatusDto = { target: 90 };
      const status = { id: 1, name: 'ACTIVO', target: 90 } as MemberStatus;

      vi.spyOn(service, 'update').mockResolvedValue(status);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(status);
    });
  });

  describe('remove', () => {
    it('should remove a status', async () => {
      const deleteResult = { affected: 1, raw: {} } as DeleteResult;

      vi.spyOn(service, 'remove').mockResolvedValue(deleteResult);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBe(deleteResult);
    });
  });
});
