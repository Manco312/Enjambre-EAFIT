import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermanencesService } from './permanences.service.js';
import { PermanencesController } from './permanences.controller.js';
import { Permanence } from './entities/permanence.entity.js';
import { MembersModule } from '../members/members.module.js';
import { ActivitiesModule } from '../activities/activities.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permanence]),
    MembersModule,
    ActivitiesModule,
  ],
  providers: [PermanencesService],
  controllers: [PermanencesController],
})
export class PermanencesModule {}
