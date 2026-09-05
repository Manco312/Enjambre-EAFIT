import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity.js';
import { Group } from './group.entity.js';
import { MemberStatus } from './member-status.entity.js'

@Entity('group_member')
@Unique(['member', 'group'])
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('Member', 'groupMembers', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_member' })
  member: Member;

  @ManyToOne('Group', 'members', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_group' })
  group: Group;

  @ManyToOne('MemberStatus', 'groupMembers')
  @JoinColumn({ name: 'id_member_status' })
  memberStatus: MemberStatus;
}
