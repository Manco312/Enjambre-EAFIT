import {
  Controller,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Get,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';

import { GroupMember } from './entities/group-member.entity.js';
import { GroupMembersService } from './group-members.service.js';
import { CreateGroupMemberDto } from './dto/create-group-member.dto.js';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto.js';

@Controller('group-members')
export class GroupMembersController {
  constructor(private readonly groupMembersService: GroupMembersService) {}

  @Get()
  async findAll(
    @Query('groupId', new ParseIntPipe({ optional: true })) groupId?: number,
    @Query('memberId', new ParseIntPipe({ optional: true })) memberId?: number,
  ): Promise<GroupMember[]> {
    if (groupId !== undefined) {
      return await this.groupMembersService.findByGroup(groupId);
    }

    if (memberId !== undefined) {
      return await this.groupMembersService.findByMember(memberId);
    }

    return await this.groupMembersService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<GroupMember> {
    return await this.groupMembersService.findById(id);
  }

  @Post()
  async create(
    @Body() createGroupMemberDto: CreateGroupMemberDto,
  ): Promise<GroupMember> {
    return await this.groupMembersService.create(createGroupMemberDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupMemberDto: UpdateGroupMemberDto,
  ): Promise<GroupMember> {
    return await this.groupMembersService.update(id, updateGroupMemberDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return await this.groupMembersService.remove(id);
  }
}
