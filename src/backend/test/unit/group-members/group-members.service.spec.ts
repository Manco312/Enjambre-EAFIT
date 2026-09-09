import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { GroupMembersService } from '../../../src/groups/group-members.service.js'; 
import { GroupMember } from '../../../src/groups/entities/group-member.entity.js'; 
import { MemberStatus } from '../../../src/groups/entities/member-status.entity.js'; 
import { Group } from '../../../src/groups/entities/group.entity.js'; 
import { GroupsService } from '../../../src/groups/groups.service.js'; 
import { MemberStatusesService } from '../../../src/groups/member-statuses.service.js';
import { Member } from '../../../src/members/entities/member.entity.js'; 

describe('GroupMembersService', () => {
  let service: GroupMembersService;
  let repository: Repository<GroupMember>;
  let membersRepository: Repository<Member>;
  let groupsService: GroupsService;
  let memberStatusesService: MemberStatusesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupMembersService,
        {
          provide: getRepositoryToken(GroupMember),
          useValue: {
            find: vi.fn(),
            findOne: vi.fn(),
            findOneBy: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            delete: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Member),
          useValue: {
            findOneBy: vi.fn(),
          },
        },
        {
          provide: GroupsService,
          useValue: {
            findById: vi.fn(),
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

    service = module.get<GroupMembersService>(GroupMembersService);
    repository = module.get<Repository<GroupMember>>(
      getRepositoryToken(GroupMember),
    );
    membersRepository = module.get<Repository<Member>>(
      getRepositoryToken(Member),
    );
    groupsService = module.get<GroupsService>(GroupsService);
    memberStatusesService = module.get<MemberStatusesService>(
      MemberStatusesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByGroup', () => {
    it('should return the memberships of a group', async () => {
      const groupMembers = [{ id: 1 }] as GroupMember[];

      vi.spyOn(repository, 'find').mockResolvedValue(groupMembers);

      const result = await service.findByGroup(1);

      expect(repository.find).toHaveBeenCalledWith({
        where: { group: { id: 1 } },
      });
      expect(result).toBe(groupMembers);
    });
  });

  describe('create', () => {
    it('should create a membership', async () => {
      const dto = { memberId: 1, groupId: 2, memberStatusId: 3 };
      const member = { id: 1 } as Member;
      const group = { id: 2 } as Group;
      const memberStatus = { id: 3 } as MemberStatus;
      const groupMember = { id: 1, member, group, memberStatus } as GroupMember;

      vi.spyOn(repository, 'findOne').mockResolvedValue(null);
      vi.spyOn(membersRepository, 'findOneBy').mockResolvedValue(member);
      vi.spyOn(groupsService, 'findById').mockResolvedValue(group);
      vi.spyOn(memberStatusesService, 'findById').mockResolvedValue(
        memberStatus,
      );
      vi.spyOn(repository, 'create').mockReturnValue(groupMember);
      vi.spyOn(repository, 'save').mockResolvedValue(groupMember);

      const result = await service.create(dto);

      expect(membersRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(groupsService.findById).toHaveBeenCalledWith(2);
      expect(memberStatusesService.findById).toHaveBeenCalledWith(3);
      expect(repository.create).toHaveBeenCalledWith({
        member,
        group,
        memberStatus,
      });
      expect(repository.save).toHaveBeenCalledWith(groupMember);
      expect(result).toBe(groupMember);
    });

    it('should throw ConflictException when the member already belongs to the group', async () => {
      const existing = { id: 1 } as GroupMember;

      vi.spyOn(repository, 'findOne').mockResolvedValue(existing);

      await expect(
        service.create({ memberId: 1, groupId: 2, memberStatusId: 3 }),
      ).rejects.toThrow('Member 1 already belongs to group 2');

      expect(membersRepository.findOneBy).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the member does not exist', async () => {
      vi.spyOn(repository, 'findOne').mockResolvedValue(null);
      vi.spyOn(membersRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.create({ memberId: 99, groupId: 2, memberStatusId: 3 }),
      ).rejects.toThrow('Member with id 99 not found');

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should reassign the member status', async () => {
      const groupMember = { id: 1 } as GroupMember;
      const memberStatus = { id: 5 } as MemberStatus;

      vi.spyOn(repository, 'findOneBy').mockResolvedValue(groupMember);
      vi.spyOn(memberStatusesService, 'findById').mockResolvedValue(
        memberStatus,
      );
      vi.spyOn(repository, 'save').mockResolvedValue(groupMember);

      const result = await service.update(1, { memberStatusId: 5 });

      expect(memberStatusesService.findById).toHaveBeenCalledWith(5);
      expect(groupMember.memberStatus).toBe(memberStatus);
      expect(repository.save).toHaveBeenCalledWith(groupMember);
      expect(result).toBe(groupMember);
    });

    it('should throw NotFoundException when the membership does not exist', async () => {
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.update(999, { memberStatusId: 5 })).rejects.toThrow(
        'GroupMember with id 999 not found',
      );

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a membership', async () => {
      const deleteResult = { affected: 1, raw: {} } as DeleteResult;

      vi.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(deleteResult);
    });
  });
});
