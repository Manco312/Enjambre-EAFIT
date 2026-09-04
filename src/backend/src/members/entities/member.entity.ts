import {
  Column,
  Entity,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupMember } from '../../groups/entities/group-member.entity.js';
import { Committee } from '../../committees/entities/committee.entity.js';
import { Permanence } from '../../permanences/entities/permanence.entity.js';

@Entity('member')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_epik' })
  idEpik: number;

  @Column({
    transformer: {
      to: (value: string) => value?.trim().toUpperCase(),
      from: (value: string) => value,
    },
  })
  fullName: string;

  @Column({ name: 'document_type' })
  documentType: string;

  @Column({ name: 'document_number' })
  documentNumber: string;

  @Column({
    transformer: {
      to: (value: string) => value?.trim().toUpperCase(),
      from: (value: string) => value,
    },
  })
  email: string;

  @Column()
  phone: string;

  @Column()
  program: string;

  @Column({ name: 'second_program' })
  secondProgram: string;

  @OneToMany('GroupMember', 'member')
  groupMembers: GroupMember[];

  @ManyToMany('Committee', 'members')
  committees: Committee[];

  @OneToMany('Permanence', 'member')
  permanences: Permanence[];
}
