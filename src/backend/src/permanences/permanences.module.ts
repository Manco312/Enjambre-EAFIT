import { Module } from '@nestjs/common';
import { PermanencesService } from './permanences.service.js';
import { PermanencesController } from './permanences.controller.js';

@Module({
  providers: [PermanencesService],
  controllers: [PermanencesController]
})
export class PermanencesModule {}
