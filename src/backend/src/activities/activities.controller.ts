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
import { Activity } from './entities/activity.entity.js';
import { ActivitiesService } from './activities.service.js';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async findAll(
    @Query('groupId', new ParseIntPipe({ optional: true })) groupId?: number,
    @Query('committeeId', new ParseIntPipe({ optional: true }))
    committeeId?: number,
  ): Promise<Activity[]> {
    if (groupId !== undefined) {
      return await this.activitiesService.findByGroup(groupId);
    }

    if (committeeId !== undefined) {
      return await this.activitiesService.findByCommittee(committeeId);
    }

    return await this.activitiesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Activity> {
    return await this.activitiesService.findById(id);
  }

  @Post()
  async create(
    @Body() createActivityDto: CreateActivityDto,
  ): Promise<Activity> {
    return await this.activitiesService.create(createActivityDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    return await this.activitiesService.update(id, updateActivityDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return await this.activitiesService.remove(id);
  }
}
