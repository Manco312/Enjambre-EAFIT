import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController } from './activities.controller.js';
import { ActivitiesService } from './activities.service.js';
import { Activity } from './entities/activity.entity.js';
import { GroupsModule } from '../groups/groups.module.js';
import { CommitteesModule } from '../committees/committees.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity]),
    GroupsModule,
    CommitteesModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
