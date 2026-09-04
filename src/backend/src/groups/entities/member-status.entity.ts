import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from './group.entity.js'
import { GroupMember } from './group-member.entity.js';


@Entity('member_status')
export class MemberStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  target: number;

  @ManyToOne('Group', 'memberStatuses')
  @JoinColumn({ name: 'id_group' })
  group: Group;

  @OneToMany('GroupMember', 'memberStatus')
  groupMembers: GroupMember[];
}
