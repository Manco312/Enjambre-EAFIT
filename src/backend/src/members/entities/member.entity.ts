import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { GroupMember } from '../../groups/entities/group-member.entity.js';

@Entity('member')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_epik' })
  idEpik: number;

  @Column()
  name: string;

  @Column({ name: 'document_type' })
  documentType: string;

  @Column({ name: 'document_number' })
  documentNumber: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  program: string;

  @Column({ name: 'second_program' })
  secondProgram: string;

  @OneToOne('User', 'member', { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @OneToMany('GroupMember', 'member')
  groupMemberships: GroupMember[];
}
