import { Test, TestingModule } from '@nestjs/testing';
import { DeleteResult } from 'typeorm';

import { MembersController } from './members.controller.js';
import { MembersService } from './members.service.js';
import { Member } from './entities/member.entity.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

describe('MembersController', () => {
  let controller: MembersController;
  let service: MembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
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

    controller = module.get<MembersController>(MembersController);
    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const members = [{ id: 1, fullName: 'Juan Pérez' }] as Member[];

    it('should return every member when no groupId is given', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue(members);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(result).toBe(members);
    });

    it('should filter by groupId when provided', async () => {
      vi.spyOn(service, 'findByGroup').mockResolvedValue(members);

      const result = await controller.findAll(2);

      expect(service.findByGroup).toHaveBeenCalledWith(2);
      expect(result).toBe(members);
    });
  });

  describe('findById', () => {
    it('should return a member', async () => {
      const member = { id: 1, fullName: 'Juan Pérez' } as Member;

      vi.spyOn(service, 'findById').mockResolvedValue(member);

      const result = await controller.findById(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toBe(member);
    });
  });

  describe('create', () => {
    it('should create and return a member', async () => {
      const dto: CreateMemberDto = {
        idEpik: 1001,
        fullName: 'Juan Pérez',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '100000001',
        email: 'juan@example.com',
        phone: '3000000001',
        program: 'Ingeniería de Sistemas',
        secondProgram: '',
        committeeIds: [3],
        groupId: 2,
        memberStatusId: 5,
      };
      const member = { id: 1, fullName: 'Juan Pérez' } as Member;

      vi.spyOn(service, 'create').mockResolvedValue(member);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(member);
    });
  });

  describe('update', () => {
    it('should update and return a member', async () => {
      const dto: UpdateMemberDto = { fullName: 'Nuevo Nombre' };
      const member = { id: 1, fullName: 'Nuevo Nombre' } as Member;

      vi.spyOn(service, 'update').mockResolvedValue(member);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(member);
    });
  });

  describe('remove', () => {
    it('should remove a member', async () => {
      const deleteResult = { affected: 1, raw: {} } as DeleteResult;

      vi.spyOn(service, 'remove').mockResolvedValue(deleteResult);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBe(deleteResult);
    });
  });
});
