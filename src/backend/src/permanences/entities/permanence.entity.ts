import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';

@Entity('permanence')
@Unique(['member', 'activity'])
export class Permanence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  percentage: number;

  @ManyToOne(() => Member, (member) => member.permanences, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id' })
  member: Member;

  @RelationId((permanence: Permanence) => permanence.member)
  memberId: number;

  @ManyToOne(() => Activity, (activity) => activity.permanences, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id' })
  activity: Activity;

  @RelationId((permanence: Permanence) => permanence.activity)
  activityId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
