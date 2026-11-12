import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController } from './activities.controller.js';
import { ActivitiesService } from './activities.service.js';
import { Activity } from './entities/activity.entity.js';
import { Permanence } from '../permanences/entities/permanence.entity.js';
import { GroupsModule } from '../groups/groups.module.js';
import { CommitteesModule } from '../committees/committees.module.js';

@Module({
  imports: [
    // Permanence se registra solo como repositorio para validar que bajar el
    // peso de una actividad no deje puntajes por encima del nuevo máximo.
    TypeOrmModule.forFeature([Activity, Permanence]),
    GroupsModule,
    CommitteesModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
