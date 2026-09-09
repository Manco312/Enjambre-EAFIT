import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../../src/auth/auth.module.js';
import { UsersModule } from '../../src/users/users.module.js';
import { PermanencesModule } from '../../src/permanences/permanences.module.js';
import { ActivitiesModule } from '../../src/activities/activities.module.js';
import { MembersModule } from '../../src/members/members.module.js';
import { GroupsModule } from '../../src/groups/groups.module.js';
import { CommitteesModule } from '../../src/committees/committees.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: ':memory:',
      autoLoadEntities: true,
      synchronize: true,
    }),

    AuthModule,
    UsersModule,
    PermanencesModule,
    ActivitiesModule,
    MembersModule,
    GroupsModule,
    CommitteesModule,
  ],
})
export class TestAppModule {}
