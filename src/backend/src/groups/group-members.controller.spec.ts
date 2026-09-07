import { Test, TestingModule } from '@nestjs/testing';
import { DeleteResult } from 'typeorm';

import { GroupMembersController } from './group-members.controller.js';
import { GroupMembersService } from './group-members.service.js';
import { GroupMember } from './entities/group-member.entity.js';
import { CreateGroupMemberDto } from './dto/create-group-member.dto.js';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto.js';

describe('GroupMembersController', () => {
  let controller: GroupMembersController;
  let service: GroupMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupMembersController],
      providers: [
        {
          provide: GroupMembersService,
          useValue: {
            findAll: vi.fn(),
            findByGroup: vi.fn(),
            findByMember: vi.fn(),
            findById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GroupMembersController>(GroupMembersController);
    service = module.get<GroupMembersService>(GroupMembersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return every membership when no filter is given', async () => {
      const groupMembers = [{ id: 1 }] as GroupMember[];

      vi.spyOn(service, 'findAll').mockResolvedValue(groupMembers);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(result).toBe(groupMembers);
    });

    it('should filter by group when groupId is given', async () => {
      const groupMembers = [{ id: 1 }] as GroupMember[];

      vi.spyOn(service, 'findByGroup').mockResolvedValue(groupMembers);

      const result = await controller.findAll(1);

      expect(service.findByGroup).toHaveBeenCalledWith(1);
      expect(service.findAll).not.toHaveBeenCalled();
      expect(result).toBe(groupMembers);
    });

    it('should filter by member when only memberId is given', async () => {
      const groupMembers = [{ id: 1 }] as GroupMember[];

      vi.spyOn(service, 'findByMember').mockResolvedValue(groupMembers);

      const result = await controller.findAll(undefined, 7);

      expect(service.findByMember).toHaveBeenCalledWith(7);
      expect(result).toBe(groupMembers);
    });
  });

  describe('findById', () => {
    it('should return a membership', async () => {
      const groupMember = { id: 1 } as GroupMember;

      vi.spyOn(service, 'findById').mockResolvedValue(groupMember);

      const result = await controller.findById(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toBe(groupMember);
    });
  });

  describe('create', () => {
    it('should create and return a membership', async () => {
      const dto: CreateGroupMemberDto = {
        memberId: 1,
        groupId: 2,
        memberStatusId: 3,
      };
      const groupMember = { id: 1 } as GroupMember;

      vi.spyOn(service, 'create').mockResolvedValue(groupMember);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(groupMember);
    });
  });

  describe('update', () => {
    it('should update and return a membership', async () => {
      const dto: UpdateGroupMemberDto = { memberStatusId: 5 };
      const groupMember = { id: 1 } as GroupMember;

      vi.spyOn(service, 'update').mockResolvedValue(groupMember);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(groupMember);
    });
  });

  describe('remove', () => {
    it('should remove a membership', async () => {
      const deleteResult = { affected: 1, raw: {} } as DeleteResult;

      vi.spyOn(service, 'remove').mockResolvedValue(deleteResult);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBe(deleteResult);
    });
  });
});
