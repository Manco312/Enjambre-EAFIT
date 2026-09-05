import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity.js';
import { Committee } from '../../committees/entities/committee.entity.js';
import { Permanence } from '../../permanences/entities/permanence.entity.js';

@Entity('activity')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  weight: number;

  @Column()
  period: string;

  @ManyToOne('Group', 'activities', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_group' })
  group: Group;

  @ManyToOne('Committee', 'activities', { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_committee' })
  committee: Committee | null;

  @OneToMany('Permanence', 'activity')
  permanences: Permanence[];
}
