import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity.js';
import { GroupMember } from '../../groups/entities/group-member.entity.js';

@Entity('committee')
export class Committee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne('Group', 'committees', { nullable: false })
  @JoinColumn({ name: 'id_group' })
  group: Group;

  @ManyToMany('GroupMember', 'committees')
  members: GroupMember[];
}
