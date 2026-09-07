import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Member } from './entities/member.entity.js';
import { MembersService } from './members.service.js';
import { MembersController } from './members.controller.js';
import { GroupsModule } from '../groups/groups.module.js';
import { CommitteesModule } from '../committees/committees.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Member]), GroupsModule, CommitteesModule],
  providers: [MembersService],
  controllers: [MembersController],
  exports: [MembersService],
})
export class MembersModule {}
