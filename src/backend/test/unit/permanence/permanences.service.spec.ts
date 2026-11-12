import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { ConflictException } from '@nestjs/common';

import { PermanencesService } from '../../../src/permanences/permanences.service.js';
import { Permanence } from '../../../src/permanences/entities/permanence.entity.js';
import { MembersService } from '../../../src/members/members.service.js';
import { ActivitiesService } from '../../../src/activities/activities.service.js';
import { GroupMembersService } from '../../../src/groups/group-members.service.js';
import { Member } from '../../../src/members/entities/member.entity.js';
import { Activity } from '../../../src/activities/entities/activity.entity.js';
import { GroupMember } from '../../../src/groups/entities/group-member.entity.js';

describe('PermanencesService', () => {
  let service: PermanencesService;
  let repository: Repository<Permanence>;
  let membersService: MembersService;
  let activitiesService: ActivitiesService;
  let groupMembersService: GroupMembersService;

  // Miembro del grupo 1 y del comité 4; actividad general de peso 20.
  const member = {
    id: 1,
    fullName: 'Member 1',
    committees: [{ id: 4 }],
  } as unknown as Member;

  const activity = {
    id: 2,
    name: 'Activity 1',
    weight: 20,
    groupId: 1,
    committeeId: null,
  } as Activity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermanencesService,
        {
          provide: getRepositoryToken(Permanence),
          useValue: {
            find: vi.fn(),
            findOneBy: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            preload: vi.fn(),
            delete: vi.fn(),
          },
        },
        {
          provide: MembersService,
          useValue: {
            findById: vi.fn(),
          },
        },
        {
          provide: ActivitiesService,
          useValue: {
            findById: vi.fn(),
          },
        },
        {
          provide: GroupMembersService,
          useValue: {
            findByMemberAndGroup: vi
              .fn()
              .mockResolvedValue({ id: 1 } as GroupMember),
          },
        },
      ],
    }).compile();

    service = module.get<PermanencesService>(PermanencesService);
    repository = module.get<Repository<Permanence>>(
      getRepositoryToken(Permanence),
    );

    membersService = module.get<MembersService>(MembersService);
    activitiesService = module.get<ActivitiesService>(ActivitiesService);
    groupMembersService = module.get<GroupMembersService>(GroupMembersService);
  });

  describe('list helpers', () => {
    const permanences = [{ id: 1, percentage: 80 }] as Permanence[];

    it('findAll should return every permanence', async () => {
      vi.spyOn(repository, 'find').mockResolvedValue(permanences);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith();
      expect(result).toBe(permanences);
    });

    it('findByMember should filter by member id', async () => {
      vi.spyOn(repository, 'find').mockResolvedValue(permanences);

      await service.findByMember(5);

      expect(repository.find).toHaveBeenCalledWith({
        where: { member: { id: 5 } },
      });
    });

    it('findByActivity should filter by activity id', async () => {
      vi.spyOn(repository, 'find').mockResolvedValue(permanences);

      await service.findByActivity(8);

      expect(repository.find).toHaveBeenCalledWith({
        where: { activity: { id: 8 } },
      });
    });

    it('findByGroup should filter by the activity group id', async () => {
      vi.spyOn(repository, 'find').mockResolvedValue(permanences);

      await service.findByGroup(2);

      expect(repository.find).toHaveBeenCalledWith({
        where: { activity: { group: { id: 2 } } },
      });
    });
  });

  describe('findById', () => {
    it('should return a permanence when it exists', async () => {
      const permanence = {
        id: 1,
        percentage: 80,
      } as Permanence;

      vi.spyOn(repository, 'findOneBy').mockResolvedValue(permanence);

      const result = await service.findById(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe(permanence);
    });

    it('should throw NotFoundException when permanence does not exist', async () => {
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        'Permanence with id 999 not found',
      );

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe('findByMemberAndActivity', () => {
    it('should return a permanence when it exists', async () => {
      const permanence = {
        id: 1,
        percentage: 80,
      } as Permanence;

      vi.spyOn(repository, 'findOne').mockResolvedValue(permanence);

      const result = await service.findByMemberAndActivity(1, 2);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          member: { id: 1 },
          activity: { id: 2 },
        },
      });

      expect(result).toBe(permanence);
    });

    it('should return null when permanence does not exist', async () => {
      vi.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findByMemberAndActivity(1, 2);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const dto = { percentage: 15, memberId: 1, activityId: 2 };

    beforeEach(() => {
      vi.spyOn(repository, 'findOne').mockResolvedValue(null);
      vi.spyOn(membersService, 'findById').mockResolvedValue(member);
      vi.spyOn(activitiesService, 'findById').mockResolvedValue(activity);
    });

    it('should create and save a permanence', async () => {
      const permanence = {
        id: 1,
        percentage: 15,
        member,
        activity,
      } as Permanence;

      vi.spyOn(repository, 'create').mockReturnValue(permanence);
      vi.spyOn(repository, 'save').mockResolvedValue(permanence);

      const result = await service.create(dto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          member: { id: 1 },
          activity: { id: 2 },
        },
      });

      expect(membersService.findById).toHaveBeenCalledWith(1);
      expect(activitiesService.findById).toHaveBeenCalledWith(2);
      expect(groupMembersService.findByMemberAndGroup).toHaveBeenCalledWith(
        1,
        1,
      );

      expect(repository.create).toHaveBeenCalledWith({
        percentage: 15,
        member,
        activity,
      });

      expect(repository.save).toHaveBeenCalledWith(permanence);
      expect(result).toBe(permanence);
    });

    it('should accept a score equal to the activity weight', async () => {
      await expect(
        service.create({ ...dto, percentage: 20 }),
      ).resolves.toBeUndefined();
    });

    it('should reject a score above the activity weight', async () => {
      await expect(service.create({ ...dto, percentage: 21 })).rejects.toThrow(
        'El puntaje (21) no puede superar el peso de la actividad (20).',
      );

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should reject a member that is not in the group of the activity', async () => {
      vi.spyOn(groupMembersService, 'findByMemberAndGroup').mockResolvedValue(
        null,
      );

      await expect(service.create(dto)).rejects.toThrow(
        'El integrante no pertenece al grupo de esta actividad.',
      );

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should reject a member that is not in the committee of the activity', async () => {
      vi.spyOn(activitiesService, 'findById').mockResolvedValue({
        ...activity,
        committeeId: 9,
      } as Activity);

      await expect(service.create(dto)).rejects.toThrow(
        'El integrante no pertenece al comité de esta actividad.',
      );

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should accept a committee activity for a member of that committee', async () => {
      vi.spyOn(activitiesService, 'findById').mockResolvedValue({
        ...activity,
        committeeId: 4,
      } as Activity);

      await expect(service.create(dto)).resolves.toBeUndefined();
    });

    it('should throw ConflictException when the permanence already exists', async () => {
      const existingPermanence = {
        id: 1,
        percentage: 80,
      } as Permanence;

      vi.spyOn(repository, 'findOne').mockResolvedValue(existingPermanence);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);

      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const current = {
      id: 1,
      percentage: 5,
      memberId: 1,
      activityId: 2,
    } as Permanence;

    beforeEach(() => {
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(current);
      vi.spyOn(membersService, 'findById').mockResolvedValue(member);
      vi.spyOn(activitiesService, 'findById').mockResolvedValue(activity);
    });

    it('should update an existing permanence', async () => {
      const permanence = {
        id: 1,
        percentage: 5,
      } as Permanence;

      vi.spyOn(repository, 'preload').mockResolvedValue(permanence);
      vi.spyOn(repository, 'save').mockResolvedValue(permanence);

      const result = await service.update(1, { percentage: 18 });

      expect(repository.preload).toHaveBeenCalledWith({
        id: 1,
        percentage: 18,
      });

      expect(repository.save).toHaveBeenCalledWith(permanence);
      expect(result).toBe(permanence);
    });

    it('should reject a score above the activity weight', async () => {
      vi.spyOn(repository, 'preload').mockResolvedValue({
        id: 1,
      } as Permanence);

      await expect(service.update(1, { percentage: 50 })).rejects.toThrow(
        'El puntaje (50) no puede superar el peso de la actividad (20).',
      );

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should update member and activity when both are provided', async () => {
      const permanence = {
        id: 1,
        percentage: 5,
      } as Permanence;

      const otherMember = { id: 2, committees: [] } as unknown as Member;
      const otherActivity = {
        id: 3,
        weight: 10,
        groupId: 1,
        committeeId: null,
      } as Activity;

      vi.spyOn(repository, 'preload').mockResolvedValue(permanence);
      vi.spyOn(repository, 'findOne').mockResolvedValue(null);
      vi.spyOn(membersService, 'findById').mockResolvedValue(otherMember);
      vi.spyOn(activitiesService, 'findById').mockResolvedValue(otherActivity);
      vi.spyOn(repository, 'save').mockResolvedValue(permanence);

      const result = await service.update(1, {
        memberId: 2,
        activityId: 3,
      });

      expect(membersService.findById).toHaveBeenCalledWith(2);
      expect(activitiesService.findById).toHaveBeenCalledWith(3);

      expect(permanence.member).toBe(otherMember);
      expect(permanence.activity).toBe(otherActivity);

      expect(repository.save).toHaveBeenCalledWith(permanence);
      expect(result).toBe(permanence);
    });

    it('should reject moving the score onto a pair that already has one', async () => {
      vi.spyOn(repository, 'preload').mockResolvedValue({
        id: 1,
      } as Permanence);
      vi.spyOn(repository, 'findOne').mockResolvedValue({
        id: 8,
      } as Permanence);

      await expect(service.update(1, { memberId: 2 })).rejects.toThrow(
        ConflictException,
      );

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating a non-existing permanence', async () => {
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.update(999, {
          percentage: 90,
        }),
      ).rejects.toThrow('Permanence with id 999 not found');

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a permanence', async () => {
      const deleteResult = {
        affected: 1,
        raw: {},
      } as DeleteResult;

      vi.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(deleteResult);
    });
  });
});
