import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';

@Entity('permanence')
@Unique(['member', 'activity'])
export class Permanence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  percentage: number;

  @ManyToOne('Member', 'permanences')
  @JoinColumn({ name: 'id_member' })
  member: Member;

  @ManyToOne('Activity', 'permanences')
  @JoinColumn({ name: 'id_activity' })
  activity: Activity;
}
