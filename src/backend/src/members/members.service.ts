import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, FindOptionsWhere, In } from 'typeorm';

import { Member } from './entities/member.entity.js';
import { Committee } from '../committees/entities/committee.entity.js';
import { Permanence } from '../permanences/entities/permanence.entity.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { CommitteesService } from '../committees/committees.service.js';
import { GroupMembersService } from '../groups/group-members.service.js';
import { MemberStatusesService } from '../groups/member-statuses.service.js';

// Campos que identifican a una persona y no se pueden repetir entre miembros.
interface MemberIdentity {
  idEpik?: number;
  email?: string;
  documentNumber?: string;
  phone?: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toUpperCase();
}

function groupIdOf(committee: Committee): number {
  return committee.group?.id ?? committee.groupId;
}

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
    @InjectRepository(Permanence)
    private readonly permanencesRepository: Repository<Permanence>,
    private readonly committeesService: CommitteesService,
    private readonly groupMembersService: GroupMembersService,
    private readonly memberStatusesService: MemberStatusesService,
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
    const {
      committeeIds = [],
      groupId,
      memberStatusId,
      ...memberData
    } = createMemberDto;

    // Se valida todo antes de guardar para no dejar un miembro sin grupo si
    // algo falla a mitad de camino.
    const memberStatus =
      await this.memberStatusesService.findById(memberStatusId);

    if ((memberStatus.group?.id ?? memberStatus.groupId) !== groupId) {
      throw new BadRequestException(
        'El estado de miembro seleccionado no pertenece a este grupo.',
      );
    }

    const committees = await this.resolveCommittees(committeeIds, [groupId]);
    const conflicts = await this.findConflicts(memberData);

    if (conflicts.length > 0) {
      const [existingMember] = conflicts;
      const isSamePerson =
        conflicts.length === 1 &&
        existingMember.idEpik === memberData.idEpik &&
        existingMember.documentNumber === memberData.documentNumber;

      if (!isSamePerson) {
        throw new ConflictException(
          this.describeConflicts(memberData, conflicts),
        );
      }

      // Misma persona (mismo ID EPIK y documento) que ya está en otro grupo:
      // se vincula a este grupo en vez de duplicarla.
      return await this.linkExistingMember(
        existingMember,
        groupId,
        memberStatusId,
        committees,
      );
    }

    const member = this.membersRepository.create({
      ...memberData,
      committees,
    });

    const savedMember = await this.membersRepository.save(member);

    try {
      await this.groupMembersService.create({
        memberId: savedMember.id,
        groupId,
        memberStatusId,
      });
    } catch (error: unknown) {
      await this.membersRepository.delete(savedMember.id);
      throw error;
    }

    return savedMember;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const { committeeIds, groupId, ...memberData } = updateMemberDto;

    const current = await this.findById(id);
    const conflicts = await this.findConflicts(memberData, id);

    if (conflicts.length > 0) {
      throw new ConflictException(
        this.describeConflicts(memberData, conflicts),
      );
    }

    const member = await this.membersRepository.preload({
      id,
      ...memberData,
    });

    if (!member) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }

    let removedCommitteeIds: number[] = [];

    if (committeeIds !== undefined) {
      const memberships = await this.groupMembersService.findByMember(id);
      const memberGroupIds = memberships.map(
        (membership) => membership.group?.id ?? membership.groupId,
      );

      if (groupId !== undefined && !memberGroupIds.includes(groupId)) {
        throw new BadRequestException(
          'El integrante no pertenece a ese grupo.',
        );
      }

      const nextCommittees = await this.resolveCommittees(
        committeeIds,
        groupId === undefined ? memberGroupIds : [groupId],
      );
      const previousCommittees = current.committees ?? [];
      // Con `groupId` solo se reemplazan los comités de ese grupo.
      const keptCommittees =
        groupId === undefined
          ? []
          : previousCommittees.filter(
              (committee) => groupIdOf(committee) !== groupId,
            );

      member.committees = [...keptCommittees, ...nextCommittees];
      removedCommitteeIds = previousCommittees
        .filter(
          (committee) =>
            !member.committees.some((next) => next.id === committee.id),
        )
        .map((committee) => committee.id);
    }

    await this.membersRepository.save(member);

    // Al salir de un comité se borran sus puntajes en las actividades de ese
    // comité, para que no reaparezcan si vuelve a entrar.
    if (removedCommitteeIds.length > 0) {
      await this.removePermanences(id, {
        activity: { committee: { id: In(removedCommitteeIds) } },
      });
    }

    return await this.findById(id);
  }

  async remove(id: number, groupId?: number): Promise<DeleteResult> {
    if (groupId === undefined) {
      return await this.membersRepository.delete(id);
    }

    const membership = await this.groupMembersService.findByMemberAndGroup(
      id,
      groupId,
    );

    if (!membership) {
      throw new NotFoundException('El integrante no pertenece a este grupo.');
    }

    const memberships = await this.groupMembersService.findByMember(id);

    // Si este era su único grupo se borra del todo (cascadea vínculos,
    // comités y puntajes).
    if (memberships.length <= 1) {
      return await this.membersRepository.delete(id);
    }

    const member = await this.findById(id);

    member.committees = (member.committees ?? []).filter(
      (committee) => groupIdOf(committee) !== groupId,
    );

    await this.membersRepository.save(member);
    await this.removePermanences(id, {
      activity: { group: { id: groupId } },
    });

    return await this.groupMembersService.remove(membership.id);
  }

  private async linkExistingMember(
    member: Member,
    groupId: number,
    memberStatusId: number,
    committees: Committee[],
  ): Promise<Member> {
    await this.groupMembersService.create({
      memberId: member.id,
      groupId,
      memberStatusId,
    });

    const currentCommittees = member.committees ?? [];

    member.committees = [
      ...currentCommittees,
      ...committees.filter(
        (committee) =>
          !currentCommittees.some((current) => current.id === committee.id),
      ),
    ];

    await this.membersRepository.save(member);

    return await this.findById(member.id);
  }

  private async findConflicts(
    identity: MemberIdentity,
    exceptId?: number,
  ): Promise<Member[]> {
    const where: FindOptionsWhere<Member>[] = [];

    if (identity.idEpik !== undefined) {
      where.push({ idEpik: identity.idEpik });
    }
    if (identity.email !== undefined) {
      where.push({ email: normalizeEmail(identity.email) });
    }
    if (identity.documentNumber !== undefined) {
      where.push({ documentNumber: identity.documentNumber });
    }
    if (identity.phone !== undefined) {
      where.push({ phone: identity.phone });
    }

    if (where.length === 0) {
      return [];
    }

    const members = await this.membersRepository.find({ where });

    return members.filter((member) => member.id !== exceptId);
  }

  private describeConflicts(
    identity: MemberIdentity,
    conflicts: Member[],
  ): string {
    const fields: string[] = [];
    const email =
      identity.email === undefined ? undefined : normalizeEmail(identity.email);

    if (
      identity.idEpik !== undefined &&
      conflicts.some((member) => member.idEpik === identity.idEpik)
    ) {
      fields.push('ID EPIK');
    }
    if (
      email !== undefined &&
      conflicts.some((member) => normalizeEmail(member.email ?? '') === email)
    ) {
      fields.push('correo electrónico');
    }
    if (
      identity.documentNumber !== undefined &&
      conflicts.some(
        (member) => member.documentNumber === identity.documentNumber,
      )
    ) {
      fields.push('número de documento');
    }
    if (
      identity.phone !== undefined &&
      conflicts.some((member) => member.phone === identity.phone)
    ) {
      fields.push('celular');
    }

    return `Ya existe otro integrante con el mismo ${fields.join(', ')}.`;
  }

  private async resolveCommittees(
    committeeIds: number[],
    allowedGroupIds: number[],
  ): Promise<Committee[]> {
    const committees = await Promise.all(
      committeeIds.map((committeeId) =>
        this.committeesService.findById(committeeId),
      ),
    );

    for (const committee of committees) {
      if (!allowedGroupIds.includes(groupIdOf(committee))) {
        throw new BadRequestException(
          `El comité «${committee.name}» no pertenece al grupo del integrante.`,
        );
      }
    }

    return committees;
  }

  private async removePermanences(
    memberId: number,
    scope: FindOptionsWhere<Permanence>,
  ): Promise<void> {
    const permanences = await this.permanencesRepository.find({
      where: { ...scope, member: { id: memberId } },
    });

    if (permanences.length > 0) {
      await this.permanencesRepository.delete(
        permanences.map((permanence) => permanence.id),
      );
    }
  }
}
