import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { GroupMember } from './entities/group-member.entity.js';
import { MemberStatus } from './entities/member-status.entity.js';
import { Member } from '../members/entities/member.entity.js';
import { CreateGroupMemberDto } from './dto/create-group-member.dto.js';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto.js';
import { GroupsService } from './groups.service.js';
import { MemberStatusesService } from './member-statuses.service.js';

@Injectable()
export class GroupMembersService {
  constructor(
    @InjectRepository(GroupMember)
    private readonly groupMembersRepository: Repository<GroupMember>,
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
    private readonly groupsService: GroupsService,
    private readonly memberStatusesService: MemberStatusesService,
  ) {}

  async findAll(): Promise<GroupMember[]> {
    return await this.groupMembersRepository.find();
  }

  async findById(id: number): Promise<GroupMember> {
    const groupMember = await this.groupMembersRepository.findOneBy({ id });

    if (!groupMember) {
      throw new NotFoundException(`GroupMember with id ${id} not found`);
    }

    return groupMember;
  }

  async findByGroup(groupId: number): Promise<GroupMember[]> {
    return await this.groupMembersRepository.find({
      where: { group: { id: groupId } },
    });
  }

  async findByMember(memberId: number): Promise<GroupMember[]> {
    return await this.groupMembersRepository.find({
      where: { member: { id: memberId } },
    });
  }

  async findByMemberAndGroup(
    memberId: number,
    groupId: number,
  ): Promise<GroupMember | null> {
    return await this.groupMembersRepository.findOne({
      where: {
        member: { id: memberId },
        group: { id: groupId },
      },
    });
  }

  async create(
    createGroupMemberDto: CreateGroupMemberDto,
  ): Promise<GroupMember> {
    const { memberId, groupId, memberStatusId } = createGroupMemberDto;

    const existingGroupMember = await this.findByMemberAndGroup(
      memberId,
      groupId,
    );

    if (existingGroupMember) {
      throw new ConflictException('El integrante ya pertenece a este grupo.');
    }

    const member = await this.membersRepository.findOneBy({ id: memberId });

    if (!member) {
      throw new NotFoundException(`Member with id ${memberId} not found`);
    }

    const group = await this.groupsService.findById(groupId);
    const memberStatus =
      await this.memberStatusesService.findById(memberStatusId);

    this.ensureStatusBelongsToGroup(memberStatus, groupId);

    const groupMember = this.groupMembersRepository.create({
      member,
      group,
      memberStatus,
    });

    return await this.groupMembersRepository.save(groupMember);
  }

  async update(
    id: number,
    updateGroupMemberDto: UpdateGroupMemberDto,
  ): Promise<GroupMember> {
    const groupMember = await this.groupMembersRepository.findOneBy({ id });

    if (!groupMember) {
      throw new NotFoundException(`GroupMember with id ${id} not found`);
    }

    if (updateGroupMemberDto.memberStatusId) {
      const memberStatus = await this.memberStatusesService.findById(
        updateGroupMemberDto.memberStatusId,
      );

      this.ensureStatusBelongsToGroup(
        memberStatus,
        groupMember.group?.id ?? groupMember.groupId,
      );

      groupMember.memberStatus = memberStatus;
    }

    return await this.groupMembersRepository.save(groupMember);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.groupMembersRepository.delete(id);
  }

  // Cada grupo define sus propios estados: no se puede asignar el de otro.
  private ensureStatusBelongsToGroup(
    memberStatus: MemberStatus,
    groupId: number,
  ): void {
    const statusGroupId = memberStatus.group?.id ?? memberStatus.groupId;

    if (statusGroupId !== groupId) {
      throw new BadRequestException(
        'El estado de miembro seleccionado no pertenece a este grupo.',
      );
    }
  }
}
