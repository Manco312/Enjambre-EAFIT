import {
  Controller,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';

import { Group } from './entities/group.entity.js';
import { GroupsService } from './groups.service.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { USER_ROLES } from '../auth/roles.js';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async findAll(): Promise<Group[]> {
    return await this.groupsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Group> {
    return await this.groupsService.findById(id);
  }

  @Roles(USER_ROLES.ADMIN)
  @Post()
  async create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return await this.groupsService.create(createGroupDto);
  }

  @Roles(USER_ROLES.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return await this.groupsService.update(id, updateGroupDto);
  }

  @Roles(USER_ROLES.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return await this.groupsService.remove(id);
  }
}
