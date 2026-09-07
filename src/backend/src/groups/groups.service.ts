import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, Not } from 'typeorm';

import { Group } from './entities/group.entity.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';

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
    return await this.groupsRepository.delete(id);
  }

  private async ensureNameIsAvailable(
    name: string,
    exceptId?: number,
  ): Promise<void> {
    const existingGroup = await this.groupsRepository.findOneBy({
      name,
      ...(exceptId === undefined ? {} : { id: Not(exceptId) }),
    });

    if (existingGroup) {
      throw new ConflictException(`Group with name ${name} already exists`);
    }
  }
}
