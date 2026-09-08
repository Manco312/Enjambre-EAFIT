import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity.js';
import { Group } from './group.entity.js';
import { MemberStatus } from './member-status.entity.js';

@Entity('group_member')
@Unique(['member', 'group'])
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member, (member) => member.groupMembers, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id' })
  member: Member;

  @RelationId((groupMember: GroupMember) => groupMember.member)
  memberId: number;

  @ManyToOne(() => Group, (group) => group.groupMembers, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id' })
  group: Group;

  @RelationId((groupMember: GroupMember) => groupMember.group)
  groupId: number;

  @ManyToOne(() => MemberStatus, (memberStatus) => memberStatus.groupMembers, {
    eager: true,
  })
  @JoinColumn({ referencedColumnName: 'id' })
  memberStatus: MemberStatus;

  @RelationId((groupMember: GroupMember) => groupMember.memberStatus)
  memberStatusId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
