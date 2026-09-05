import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermanencesService } from './permanences.service.js';
import { PermanencesController } from './permanences.controller.js';
import { Permanence } from './entities/permanence.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permanence]),
  ],
  providers: [PermanencesService],
  controllers: [PermanencesController]
})
export class PermanencesModule {}
