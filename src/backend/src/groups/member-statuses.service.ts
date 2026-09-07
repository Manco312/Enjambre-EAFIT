import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { MemberStatus } from './entities/member-status.entity.js';
import { CreateMemberStatusDto } from './dto/create-member-status.dto.js';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto.js';
import { GroupsService } from './groups.service.js';

@Injectable()
export class MemberStatusesService {
  constructor(
    @InjectRepository(MemberStatus)
    private readonly memberStatusesRepository: Repository<MemberStatus>,
    private readonly groupsService: GroupsService,
  ) {}

  async findAll(): Promise<MemberStatus[]> {
    return await this.memberStatusesRepository.find();
  }

  async findById(id: number): Promise<MemberStatus> {
    const memberStatus = await this.memberStatusesRepository.findOneBy({ id });

    if (!memberStatus) {
      throw new NotFoundException(`MemberStatus with id ${id} not found`);
    }

    return memberStatus;
  }

  async findByGroup(groupId: number): Promise<MemberStatus[]> {
    return await this.memberStatusesRepository.find({
      where: { group: { id: groupId } },
    });
  }

  async create(
    createMemberStatusDto: CreateMemberStatusDto,
  ): Promise<MemberStatus> {
    const { groupId, ...memberStatusData } = createMemberStatusDto;

    const group = await this.groupsService.findById(groupId);

    const memberStatus = this.memberStatusesRepository.create({
      ...memberStatusData,
      group,
    });

    return await this.memberStatusesRepository.save(memberStatus);
  }

  async update(
    id: number,
    updateMemberStatusDto: UpdateMemberStatusDto,
  ): Promise<MemberStatus> {
    const { groupId, ...memberStatusData } = updateMemberStatusDto;

    const memberStatus = await this.memberStatusesRepository.preload({
      id,
      ...memberStatusData,
    });

    if (!memberStatus) {
      throw new NotFoundException(`MemberStatus with id ${id} not found`);
    }

    if (groupId) {
      memberStatus.group = await this.groupsService.findById(groupId);
    }

    return await this.memberStatusesRepository.save(memberStatus);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.memberStatusesRepository.delete(id);
  }
}
