import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { GroupMember } from '../../groups/entities/group-member.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';

@Entity('permanence')
@Unique(['groupMember', 'activity'])
export class Permanence {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('GroupMember', 'permanences', { nullable: false })
  @JoinColumn({ name: 'id_group_member' })
  groupMember: GroupMember;

  @ManyToOne('Activity', 'permanences', { nullable: false })
  @JoinColumn({ name: 'id_activity' })
  activity: Activity;

  @Column()
  percentage: number;
}
