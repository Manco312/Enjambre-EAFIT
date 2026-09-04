import { Module } from '@nestjs/common';
import { HomeModule } from './home/home.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { PermanencesModule } from './permanences/permanences.module.js';
import { ActivitiesModule } from './activities/activities.module.js';
import { MembersModule } from './members/members.module.js';
import { GroupsModule } from './groups/groups.module.js';
import { CommitteesModule } from './committees/committees.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    HomeModule,
    AuthModule,
    UsersModule,
    PermanencesModule,
    ActivitiesModule,
    MembersModule,
    GroupsModule,
    CommitteesModule,
  ],
})
export class AppModule {}
