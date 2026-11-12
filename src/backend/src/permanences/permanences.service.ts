import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { Permanence } from './entities/permanence.entity.js';
import { Member } from '../members/entities/member.entity.js';
import { Activity } from '../activities/entities/activity.entity.js';
import { CreatePermanenceDto } from './dto/create-permanence.dto.js';
import { UpdatePermanenceDto } from './dto/update-permanence.dto.js';
import { MembersService } from '../members/members.service.js';
import { ActivitiesService } from '../activities/activities.service.js';
import { GroupMembersService } from '../groups/group-members.service.js';

@Injectable()
export class PermanencesService {
  constructor(
    @InjectRepository(Permanence)
    private readonly permanencesRepository: Repository<Permanence>,
    private readonly membersService: MembersService,
    private readonly activitiesService: ActivitiesService,
    private readonly groupMembersService: GroupMembersService,
  ) {}

  async findAll(): Promise<Permanence[]> {
    return await this.permanencesRepository.find();
  }

  async findByMember(memberId: number): Promise<Permanence[]> {
    return await this.permanencesRepository.find({
      where: { member: { id: memberId } },
    });
  }

  async findByActivity(activityId: number): Promise<Permanence[]> {
    return await this.permanencesRepository.find({
      where: { activity: { id: activityId } },
    });
  }

  async findByGroup(groupId: number): Promise<Permanence[]> {
    return await this.permanencesRepository.find({
      where: { activity: { group: { id: groupId } } },
    });
  }

  async findById(id: number): Promise<Permanence> {
    const permanence = await this.permanencesRepository.findOneBy({ id });

    if (!permanence) {
      throw new NotFoundException(`Permanence with id ${id} not found`);
    }

    return permanence;
  }

  async findByMemberAndActivity(
    memberId: number,
    activityId: number,
  ): Promise<Permanence | null> {
    return await this.permanencesRepository.findOne({
      where: {
        member: { id: memberId },
        activity: { id: activityId },
      },
    });
  }

  async create(createPermanenceDto: CreatePermanenceDto): Promise<Permanence> {
    const { memberId, activityId, ...permanenceData } = createPermanenceDto;
    const existingPermanence = await this.findByMemberAndActivity(
      memberId,
      activityId,
    );

    if (existingPermanence) {
      throw new ConflictException(
        'El integrante ya tiene un puntaje registrado en esta actividad.',
      );
    }

    const member = await this.membersService.findById(memberId);
    const activity = await this.activitiesService.findById(activityId);

    await this.ensureIsValid(member, activity, permanenceData.percentage);

    const permanence = this.permanencesRepository.create({
      ...permanenceData,
      member,
      activity,
    });

    return await this.permanencesRepository.save(permanence);
  }

  async update(
    id: number,
    updatePermanenceDto: UpdatePermanenceDto,
  ): Promise<Permanence> {
    const { memberId, activityId, ...permanenceData } = updatePermanenceDto;

    const current = await this.findById(id);

    const permanence = await this.permanencesRepository.preload({
      id,
      ...permanenceData,
    });

    if (!permanence) {
      throw new NotFoundException(`Permanence with id ${id} not found`);
    }

    const nextMemberId = memberId ?? current.member?.id ?? current.memberId;
    const nextActivityId =
      activityId ?? current.activity?.id ?? current.activityId;

    const member = await this.membersService.findById(nextMemberId);
    const activity = await this.activitiesService.findById(nextActivityId);

    if (memberId || activityId) {
      const existingPermanence = await this.findByMemberAndActivity(
        nextMemberId,
        nextActivityId,
      );

      if (existingPermanence && existingPermanence.id !== id) {
        throw new ConflictException(
          'El integrante ya tiene un puntaje registrado en esta actividad.',
        );
      }
    }

    await this.ensureIsValid(
      member,
      activity,
      permanenceData.percentage ?? current.percentage,
    );

    if (memberId) {
      permanence.member = member;
    }

    if (activityId) {
      permanence.activity = activity;
    }

    return await this.permanencesRepository.save(permanence);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.permanencesRepository.delete(id);
  }

  // `percentage` son los puntos obtenidos en la actividad: van de 0 a su peso.
  // Además el integrante debe pertenecer al grupo (y al comité, si la
  // actividad es de comité) al que pertenece la actividad.
  private async ensureIsValid(
    member: Member,
    activity: Activity,
    percentage: number,
  ): Promise<void> {
    if (percentage > activity.weight) {
      throw new BadRequestException(
        `El puntaje (${percentage}) no puede superar el peso de la actividad (${activity.weight}).`,
      );
    }

    const groupId = activity.group?.id ?? activity.groupId;
    const membership = await this.groupMembersService.findByMemberAndGroup(
      member.id,
      groupId,
    );

    if (!membership) {
      throw new BadRequestException(
        'El integrante no pertenece al grupo de esta actividad.',
      );
    }

    const committeeId = activity.committee?.id ?? activity.committeeId ?? null;

    if (
      committeeId !== null &&
      !(member.committees ?? []).some(
        (committee) => committee.id === committeeId,
      )
    ) {
      throw new BadRequestException(
        'El integrante no pertenece al comité de esta actividad.',
      );
    }
  }
}
