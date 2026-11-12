import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { Committee } from './entities/committee.entity.js';
import { CreateCommitteeDto } from './dto/create-committee.dto.js';
import { UpdateCommitteeDto } from './dto/update-committee.dto.js';
import { GroupsService } from '../groups/groups.service.js';
import { normalizeName } from '../utils/validation.util.js';

@Injectable()
export class CommitteesService {
  constructor(
    @InjectRepository(Committee)
    private readonly committeesRepository: Repository<Committee>,
    private readonly groupsService: GroupsService,
  ) {}

  async findAll(): Promise<Committee[]> {
    return await this.committeesRepository.find();
  }

  async findById(id: number): Promise<Committee> {
    const committee = await this.committeesRepository.findOneBy({ id });

    if (!committee) {
      throw new NotFoundException(`Committee with id ${id} not found`);
    }

    return committee;
  }

  async findByGroup(groupId: number): Promise<Committee[]> {
    return await this.committeesRepository.find({
      where: { group: { id: groupId } },
    });
  }

  async create(createCommitteeDto: CreateCommitteeDto): Promise<Committee> {
    const { groupId, ...committeeData } = createCommitteeDto;

    const group = await this.groupsService.findById(groupId);

    await this.ensureNameIsAvailable(groupId, committeeData.name);

    const committee = this.committeesRepository.create({
      ...committeeData,
      group,
    });

    return await this.committeesRepository.save(committee);
  }

  async update(
    id: number,
    updateCommitteeDto: UpdateCommitteeDto,
  ): Promise<Committee> {
    const { groupId, ...committeeData } = updateCommitteeDto;

    const current = await this.findById(id);

    if (committeeData.name !== undefined || groupId !== undefined) {
      await this.ensureNameIsAvailable(
        groupId ?? current.group?.id ?? current.groupId,
        committeeData.name ?? current.name,
        id,
      );
    }

    const committee = await this.committeesRepository.preload({
      id,
      ...committeeData,
    });

    if (!committee) {
      throw new NotFoundException(`Committee with id ${id} not found`);
    }

    if (groupId) {
      committee.group = await this.groupsService.findById(groupId);
    }

    return await this.committeesRepository.save(committee);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.committeesRepository.delete(id);
  }

  // Los comités se eligen por nombre en la interfaz, así que dos comités con el
  // mismo nombre dentro de un grupo serían indistinguibles.
  private async ensureNameIsAvailable(
    groupId: number,
    name: string,
    exceptId?: number,
  ): Promise<void> {
    const normalized = normalizeName(name);
    const committees = await this.findByGroup(groupId);
    const isTaken = committees.some(
      (committee) =>
        committee.id !== exceptId &&
        normalizeName(committee.name) === normalized,
    );

    if (isTaken) {
      throw new ConflictException(
        `El grupo ya tiene un comité llamado «${name.trim()}».`,
      );
    }
  }
}
