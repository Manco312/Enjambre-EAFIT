import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, IsNull } from 'typeorm';

import { Activity } from './entities/activity.entity.js';
import { Permanence } from '../permanences/entities/permanence.entity.js';
import { Committee } from '../committees/entities/committee.entity.js';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';
import { getCurrentPeriod } from '../utils/period.util.js';
import { MAX_PERCENTAGE } from '../utils/validation.util.js';
import { GroupsService } from '../groups/groups.service.js';
import { CommitteesService } from '../committees/committees.service.js';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
    @InjectRepository(Permanence)
    private readonly permanencesRepository: Repository<Permanence>,
    private readonly groupsService: GroupsService,
    private readonly committeesService: CommitteesService,
  ) {}

  async findAll(): Promise<Activity[]> {
    return await this.activitiesRepository.find();
  }

  async findByGroup(groupId: number): Promise<Activity[]> {
    return await this.activitiesRepository.find({
      where: { group: { id: groupId } },
    });
  }

  async findByCommittee(committeeId: number): Promise<Activity[]> {
    return await this.activitiesRepository.find({
      where: { committee: { id: committeeId } },
    });
  }

  async findById(id: number): Promise<Activity> {
    const activity = await this.activitiesRepository.findOneBy({ id });

    if (!activity) {
      throw new NotFoundException(`Activity with id ${id} not found`);
    }

    return activity;
  }

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const { groupId, committeeId, description, ...activityData } =
      createActivityDto;
    const group = await this.groupsService.findById(groupId);
    const committee =
      committeeId === null
        ? null
        : await this.committeesService.findById(committeeId);

    if (!group) {
      throw new NotFoundException(`Group with id ${groupId} not found`);
    }

    if (committeeId !== null && !committee) {
      throw new NotFoundException(`Committee with id ${committeeId} not found`);
    }

    this.ensureCommitteeBelongsToGroup(committee, groupId);
    await this.ensureSheetHasRoom(groupId, committeeId, activityData.weight);

    const activity = this.activitiesRepository.create({
      ...activityData,
      description: description ?? '',
      period: getCurrentPeriod(),
      group,
      committee,
    });

    return await this.activitiesRepository.save(activity);
  }

  async update(
    id: number,
    updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    const { groupId, committeeId, ...activityData } = updateActivityDto;

    const current = await this.findById(id);

    const activity = await this.activitiesRepository.preload({
      id,
      ...activityData,
    });

    if (!activity) {
      throw new NotFoundException(`Activity with id ${id} not found`);
    }

    const nextGroupId = groupId ?? current.group?.id ?? current.groupId;
    const nextCommitteeId =
      committeeId !== undefined
        ? committeeId
        : (current.committee?.id ?? current.committeeId ?? null);
    const nextWeight = activityData.weight ?? current.weight;

    if (groupId) {
      const group = await this.groupsService.findById(groupId);
      activity.group = group;
    }

    if (committeeId !== undefined) {
      const committee =
        committeeId === null
          ? null
          : await this.committeesService.findById(committeeId);
      activity.committee = committee;
    }

    const movesSheet = groupId !== undefined || committeeId !== undefined;

    if (movesSheet) {
      this.ensureCommitteeBelongsToGroup(
        committeeId !== undefined ? activity.committee : current.committee,
        nextGroupId,
      );
    }

    if (movesSheet || activityData.weight !== undefined) {
      await this.ensureSheetHasRoom(
        nextGroupId,
        nextCommitteeId,
        nextWeight,
        id,
      );
    }

    if (activityData.weight !== undefined) {
      await this.ensureWeightCoversScores(id, activityData.weight);
    }

    return await this.activitiesRepository.save(activity);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.activitiesRepository.delete(id);
  }

  private ensureCommitteeBelongsToGroup(
    committee: Committee | null,
    groupId: number,
  ): void {
    if (committee === null) {
      return;
    }

    const committeeGroupId = committee.group?.id ?? committee.groupId;

    if (committeeGroupId !== groupId) {
      throw new BadRequestException(
        'El comité de la actividad no pertenece a este grupo.',
      );
    }
  }

  // Una "hoja" son las actividades generales del grupo (committeeId null) o
  // las de un comité. Sus pesos son porcentajes, así que no pueden sumar más
  // de 100.
  private async ensureSheetHasRoom(
    groupId: number,
    committeeId: number | null,
    weight: number,
    exceptId?: number,
  ): Promise<void> {
    const siblings = await this.activitiesRepository.find({
      where: {
        group: { id: groupId },
        committee: committeeId === null ? IsNull() : { id: committeeId },
      },
    });

    const used = siblings
      .filter((sibling) => sibling.id !== exceptId)
      .reduce((sum, sibling) => sum + sibling.weight, 0);

    if (used + weight > MAX_PERCENTAGE) {
      const available = Math.max(0, MAX_PERCENTAGE - used);

      throw new BadRequestException(
        `Los pesos de las actividades de la hoja no pueden sumar más de ${MAX_PERCENTAGE}%. Disponible: ${available}%.`,
      );
    }
  }

  // Los puntajes van de 0 al peso de la actividad: no se puede bajar el peso
  // por debajo de un puntaje ya registrado.
  private async ensureWeightCoversScores(
    activityId: number,
    weight: number,
  ): Promise<void> {
    const permanences = await this.permanencesRepository.find({
      where: { activity: { id: activityId } },
    });

    const highest = permanences.reduce(
      (max, permanence) => Math.max(max, permanence.percentage),
      0,
    );

    if (highest > weight) {
      throw new BadRequestException(
        `No se puede bajar el peso a ${weight}%: hay integrantes con hasta ${highest} puntos en esta actividad. Ajusta primero esos puntajes.`,
      );
    }
  }
}
