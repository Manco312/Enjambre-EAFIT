import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Group } from './entities/group.entity.js';
import { GroupMember } from './entities/group-member.entity.js';
import { MemberStatus } from './entities/member-status.entity.js';
import { Member } from '../members/entities/member.entity.js';
import { GroupsService } from './groups.service.js';
import { GroupMembersService } from './group-members.service.js';
import { MemberStatusesService } from './member-statuses.service.js';
import { GroupsController } from './groups.controller.js';
import { GroupMembersController } from './group-members.controller.js';
import { MemberStatusesController } from './member-statuses.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupMember, MemberStatus, Member]),
  ],
  providers: [GroupsService, GroupMembersService, MemberStatusesService],
  controllers: [
    GroupsController,
    GroupMembersController,
    MemberStatusesController,
  ],
  exports: [GroupsService, GroupMembersService, MemberStatusesService],
})
export class GroupsModule {}
