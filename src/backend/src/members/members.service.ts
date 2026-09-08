import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { Member } from './entities/member.entity.js';
import { Committee } from '../committees/entities/committee.entity.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { CommitteesService } from '../committees/committees.service.js';
import { GroupMembersService } from '../groups/group-members.service.js';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
    private readonly committeesService: CommitteesService,
    private readonly groupMembersService: GroupMembersService,
  ) {}

  async findAll(): Promise<Member[]> {
    return await this.membersRepository.find();
  }

  async findByGroup(groupId: number): Promise<Member[]> {
    return await this.membersRepository.find({
      where: { groupMembers: { group: { id: groupId } } },
    });
  }

  async findById(id: number): Promise<Member> {
    const member = await this.membersRepository.findOneBy({ id });

    if (!member) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }

    return member;
  }

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const { committeeIds, groupId, memberStatusId, ...memberData } =
      createMemberDto;

    const existingMember = await this.membersRepository.findOne({
      where: [
        { idEpik: memberData.idEpik },
        { email: memberData.email },
        { documentNumber: memberData.documentNumber },
        { phone: memberData.phone },
      ],
    });

    if (existingMember) {
      throw new ConflictException(
        'A member with the same idEpik, email, document number or phone already exists',
      );
    }

    const member = this.membersRepository.create(memberData);

    if (committeeIds !== undefined) {
      member.committees = await this.resolveCommittees(committeeIds);
    }

    const savedMember = await this.membersRepository.save(member);

    await this.groupMembersService.create({
      memberId: savedMember.id,
      groupId,
      memberStatusId,
    });

    return savedMember;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const { committeeIds, ...memberData } = updateMemberDto;

    const member = await this.membersRepository.preload({
      id,
      ...memberData,
    });

    if (!member) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }

    if (committeeIds !== undefined) {
      member.committees = await this.resolveCommittees(committeeIds);
    }

    return await this.membersRepository.save(member);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.membersRepository.delete(id);
  }

  private async resolveCommittees(
    committeeIds: number[],
  ): Promise<Committee[]> {
    return await Promise.all(
      committeeIds.map((committeeId) =>
        this.committeesService.findById(committeeId),
      ),
    );
  }
}
