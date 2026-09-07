import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { Committee } from './entities/committee.entity.js';
import { CreateCommitteeDto } from './dto/create-committee.dto.js';
import { UpdateCommitteeDto } from './dto/update-committee.dto.js';
import { GroupsService } from '../groups/groups.service.js';

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
}
