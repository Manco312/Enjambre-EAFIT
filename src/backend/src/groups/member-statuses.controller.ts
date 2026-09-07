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

import { MemberStatus } from './entities/member-status.entity.js';
import { MemberStatusesService } from './member-statuses.service.js';
import { CreateMemberStatusDto } from './dto/create-member-status.dto.js';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto.js';

@Controller('member-statuses')
export class MemberStatusesController {
  constructor(private readonly memberStatusesService: MemberStatusesService) {}

  @Get()
  async findAll(
    @Query('groupId', new ParseIntPipe({ optional: true })) groupId?: number,
  ): Promise<MemberStatus[]> {
    return groupId === undefined
      ? await this.memberStatusesService.findAll()
      : await this.memberStatusesService.findByGroup(groupId);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<MemberStatus> {
    return await this.memberStatusesService.findById(id);
  }

  @Post()
  async create(
    @Body() createMemberStatusDto: CreateMemberStatusDto,
  ): Promise<MemberStatus> {
    return await this.memberStatusesService.create(createMemberStatusDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMemberStatusDto: UpdateMemberStatusDto,
  ): Promise<MemberStatus> {
    return await this.memberStatusesService.update(id, updateMemberStatusDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return await this.memberStatusesService.remove(id);
  }
}
