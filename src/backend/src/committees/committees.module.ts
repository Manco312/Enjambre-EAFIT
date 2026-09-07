import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Committee } from './entities/committee.entity.js';
import { CommitteesService } from './committees.service.js';
import { CommitteesController } from './committees.controller.js';
import { GroupsModule } from '../groups/groups.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Committee]), GroupsModule],
  providers: [CommitteesService],
  controllers: [CommitteesController],
  exports: [CommitteesService],
})
export class CommitteesModule {}
