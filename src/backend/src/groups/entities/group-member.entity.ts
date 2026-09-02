import {
  Entity,
  Column,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  JoinTable,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity.js';
import { Group } from './group.entity.js';
import { Permanence } from '../../permanences/entities/permanence.entity.js';
import { Committee } from '../../committees/entities/committee.entity.js';

@Entity('group_member')
@Unique(['member', 'group'])
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'membership_status' })
  membershipStatus: string;

  @ManyToOne('Member', 'groupMemberships', { nullable: false })
  @JoinColumn({ name: 'id_member' })
  member: Member;

  @ManyToOne('Group', 'members', { nullable: false })
  @JoinColumn({ name: 'id_group' })
  group: Group;

  @OneToMany('Permanence', 'groupMember')
  permanences: Permanence[];

  @ManyToMany('Committee', 'members')
  @JoinTable({
    name: 'committee_member',
    joinColumn: {
      name: 'id_group_member',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'id_committee',
      referencedColumnName: 'id',
    },
  })
  committees: Committee[];
}
