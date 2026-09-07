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

import { Committee } from './entities/committee.entity.js';
import { CommitteesService } from './committees.service.js';
import { CreateCommitteeDto } from './dto/create-committee.dto.js';
import { UpdateCommitteeDto } from './dto/update-committee.dto.js';

@Controller('committees')
export class CommitteesController {
  constructor(private readonly committeesService: CommitteesService) {}

  @Get()
  async findAll(
    @Query('groupId', new ParseIntPipe({ optional: true })) groupId?: number,
  ): Promise<Committee[]> {
    return groupId === undefined
      ? await this.committeesService.findAll()
      : await this.committeesService.findByGroup(groupId);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Committee> {
    return await this.committeesService.findById(id);
  }

  @Post()
  async create(
    @Body() createCommitteeDto: CreateCommitteeDto,
  ): Promise<Committee> {
    return await this.committeesService.create(createCommitteeDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommitteeDto: UpdateCommitteeDto,
  ): Promise<Committee> {
    return await this.committeesService.update(id, updateCommitteeDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return await this.committeesService.remove(id);
  }
}
