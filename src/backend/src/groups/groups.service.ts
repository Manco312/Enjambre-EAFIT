import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { Group } from './entities/group.entity.js';
import { GroupMember } from './entities/group-member.entity.js';
import { Member } from '../members/entities/member.entity.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { normalizeName } from '../utils/validation.util.js';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
  ) {}

  async findAll(): Promise<Group[]> {
    return await this.groupsRepository.find();
  }

  async findById(id: number): Promise<Group> {
    const group = await this.groupsRepository.findOneBy({ id });

    if (!group) {
      throw new NotFoundException(`Group with id ${id} not found`);
    }

    return group;
  }

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    await this.ensureNameIsAvailable(createGroupDto.name);

    const group = this.groupsRepository.create(createGroupDto);

    return await this.groupsRepository.save(group);
  }

  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    if (updateGroupDto.name !== undefined) {
      await this.ensureNameIsAvailable(updateGroupDto.name, id);
    }

    const group = await this.groupsRepository.preload({
      id,
      ...updateGroupDto,
    });

    if (!group) {
      throw new NotFoundException(`Group with id ${id} not found`);
    }

    return await this.groupsRepository.save(group);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.groupsRepository.manager.transaction(async (manager) => {
      const links = await manager.find(GroupMember, {
        where: { group: { id } },
        relations: { member: true },
      });

      await manager.delete(GroupMember, { group: { id } });

      for (const { member } of links) {
        const stillLinked = await manager.count(GroupMember, {
          where: { member: { id: member.id } },
        });

        if (stillLinked === 0) {
          await manager.delete(Member, member.id);
        }
      }

      return await manager.delete(Group, id);
    });
  }

  // La comparación ignora mayúsculas y espacios de los extremos: «SPIE» y
  // « spie» son el mismo grupo.
  private async ensureNameIsAvailable(
    name: string,
    exceptId?: number,
  ): Promise<void> {
    const normalized = normalizeName(name);
    const groups = await this.groupsRepository.find();
    const isTaken = groups.some(
      (group) =>
        group.id !== exceptId && normalizeName(group.name) === normalized,
    );

    if (isTaken) {
      throw new ConflictException(
        `Ya existe un grupo estudiantil con el nombre «${name.trim()}».`,
      );
    }
  }
}
