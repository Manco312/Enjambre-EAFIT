import {
  Column,
  Entity,
  OneToMany,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  JoinTable,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';
import { Member } from '../../members/entities/member.entity.js';

@Entity('committee')
export class Committee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne('Group', 'committees')
  @JoinColumn({ name: 'id_group' })
  group: Group;

  @OneToMany('Activity', 'committee')
  activities: Activity[];

  @ManyToMany('Member', 'committees')
  @JoinTable()
  members: Member[];
}
