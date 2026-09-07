import { Test, TestingModule } from '@nestjs/testing';
import { DeleteResult } from 'typeorm';

import { CommitteesController } from './committees.controller.js';
import { CommitteesService } from './committees.service.js';
import { Committee } from './entities/committee.entity.js';
import { CreateCommitteeDto } from './dto/create-committee.dto.js';
import { UpdateCommitteeDto } from './dto/update-committee.dto.js';

describe('CommitteesController', () => {
  let controller: CommitteesController;
  let service: CommitteesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommitteesController],
      providers: [
        {
          provide: CommitteesService,
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

    controller = module.get<CommitteesController>(CommitteesController);
    service = module.get<CommitteesService>(CommitteesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return every committee when no group filter is given', async () => {
      const committees = [{ id: 1, name: 'DIVULGACIÓN' }] as Committee[];

      vi.spyOn(service, 'findAll').mockResolvedValue(committees);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(service.findByGroup).not.toHaveBeenCalled();
      expect(result).toBe(committees);
    });

    it('should filter by group when groupId is given', async () => {
      const committees = [{ id: 1, name: 'DIVULGACIÓN' }] as Committee[];

      vi.spyOn(service, 'findByGroup').mockResolvedValue(committees);

      const result = await controller.findAll(1);

      expect(service.findByGroup).toHaveBeenCalledWith(1);
      expect(service.findAll).not.toHaveBeenCalled();
      expect(result).toBe(committees);
    });
  });

  describe('findById', () => {
    it('should return a committee', async () => {
      const committee = { id: 1, name: 'DIVULGACIÓN' } as Committee;

      vi.spyOn(service, 'findById').mockResolvedValue(committee);

      const result = await controller.findById(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toBe(committee);
    });
  });

  describe('create', () => {
    it('should create and return a committee', async () => {
      const dto: CreateCommitteeDto = { name: 'DIVULGACIÓN', groupId: 1 };
      const committee = { id: 1, name: 'DIVULGACIÓN' } as Committee;

      vi.spyOn(service, 'create').mockResolvedValue(committee);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(committee);
    });
  });

  describe('update', () => {
    it('should update and return a committee', async () => {
      const dto: UpdateCommitteeDto = { name: 'New name' };
      const committee = { id: 1, name: 'New name' } as Committee;

      vi.spyOn(service, 'update').mockResolvedValue(committee);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(committee);
    });
  });

  describe('remove', () => {
    it('should remove a committee', async () => {
      const deleteResult = { affected: 1, raw: {} } as DeleteResult;

      vi.spyOn(service, 'remove').mockResolvedValue(deleteResult);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBe(deleteResult);
    });
  });
});
