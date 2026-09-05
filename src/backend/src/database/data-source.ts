import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';

import { User } from '../users/entities/user.entity.js';
import { Group } from '../groups/entities/group.entity.js';
import { GroupMember } from '../groups/entities/group-member.entity.js';
import { MemberStatus } from '../groups/entities/member-status.entity.js';
import { Member } from '../members/entities/member.entity.js';
import { Committee } from '../committees/entities/committee.entity.js';
import { Activity } from '../activities/entities/activity.entity.js';
import { Permanence } from '../permanences/entities/permanence.entity.js';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'database.sqlite',

  entities: [
    Activity,
    Committee,
    Group,
    GroupMember,
    MemberStatus,
    Member,
    Permanence,
    User,
  ],

  synchronize: true,
});
