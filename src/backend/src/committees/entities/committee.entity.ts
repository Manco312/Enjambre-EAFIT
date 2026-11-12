import {
  Column,
  Entity,
  OneToMany,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';
import { Member } from '../../members/entities/member.entity.js';

@Entity('committee')
export class Committee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Group, (group) => group.committees, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id' })
  group: Group;

  @RelationId((committee: Committee) => committee.group)
  groupId: number;

  @OneToMany('Activity', 'committee')
  activities: Activity[];

  // onDelete va en el lado inverso: al borrar un comité se borran sus filas de
  // committee_member (si no, la FK impide borrar comités con integrantes).
  @ManyToMany(() => Member, (member) => member.committees, {
    onDelete: 'CASCADE',
  })
  members: Member[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
