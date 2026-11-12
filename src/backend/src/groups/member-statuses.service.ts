import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, QueryFailedError } from 'typeorm';

import { MemberStatus } from './entities/member-status.entity.js';
import { CreateMemberStatusDto } from './dto/create-member-status.dto.js';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto.js';
import { GroupsService } from './groups.service.js';
import { normalizeName } from '../utils/validation.util.js';

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

    await this.ensureNameIsAvailable(groupId, memberStatusData.name);

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

    const current = await this.findById(id);

    if (memberStatusData.name !== undefined || groupId !== undefined) {
      await this.ensureNameIsAvailable(
        groupId ?? current.group?.id ?? current.groupId,
        memberStatusData.name ?? current.name,
        id,
      );
    }

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
    try {
      return await this.memberStatusesRepository.delete(id);
    } catch (error: unknown) {
      // GroupMember.memberStatus no cascadea: un estado con integrantes
      // asignados no se puede borrar hasta moverlos a otro estado.
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'No se puede eliminar el estado porque tiene integrantes asignados. Muévelos a otro estado primero.',
        );
      }
      throw error;
    }
  }

  private async ensureNameIsAvailable(
    groupId: number,
    name: string,
    exceptId?: number,
  ): Promise<void> {
    const normalized = normalizeName(name);
    const statuses = await this.findByGroup(groupId);
    const isTaken = statuses.some(
      (status) =>
        status.id !== exceptId && normalizeName(status.name) === normalized,
    );

    if (isTaken) {
      throw new ConflictException(
        `El grupo ya tiene un estado de miembro llamado «${name.trim()}».`,
      );
    }
  }
}
