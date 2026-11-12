import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Member } from './entities/member.entity.js';
import { Permanence } from '../permanences/entities/permanence.entity.js';
import { MembersService } from './members.service.js';
import { MembersController } from './members.controller.js';
import { GroupsModule } from '../groups/groups.module.js';
import { CommitteesModule } from '../committees/committees.module.js';

@Module({
  imports: [
    // Permanence se registra solo como repositorio (no como módulo) para poder
    // limpiar los puntajes de un integrante sin crear un ciclo de módulos.
    TypeOrmModule.forFeature([Member, Permanence]),
    GroupsModule,
    CommitteesModule,
  ],
  providers: [MembersService],
  controllers: [MembersController],
  exports: [MembersService],
})
export class MembersModule {}
