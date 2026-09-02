import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity.js';
import { Permanence } from '../../permanences/entities/permanence.entity.js';

@Entity('activity')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne('Group', 'activities', { nullable: false })
  @JoinColumn({ name: 'id_group' })
  group: Group;

  @OneToMany('Permanence', 'activity')
  permanences: Permanence[];
}
