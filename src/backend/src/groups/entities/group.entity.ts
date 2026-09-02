import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupMember } from './group-member.entity.js';
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

  @OneToMany('Activity', 'group')
  activities: Activity[];

  @OneToMany('Committee', 'group')
  committees: Committee[];
}
