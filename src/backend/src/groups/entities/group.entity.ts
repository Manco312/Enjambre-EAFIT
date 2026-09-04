import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupMember } from './group-member.entity.js';
import { MemberStatus } from './member-status.entity.js'
import { User } from '../../users/entities/user.entity.js';
import { Committee } from '../../committees/entities/committee.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';

@Entity('group')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany('GroupMember', 'group')
  members: GroupMember[];

  @OneToMany('MemberStatus', 'group')
  memberStatuses: MemberStatus[];

  @OneToOne('User', 'group')
  user: User | null;

  @OneToMany('Activity', 'group')
  activities: Activity[];

  @OneToMany('Committee', 'group')
  committees: Committee[];
}
