import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity.js';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @OneToOne('Group', 'user', { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_group' })
  group: Group | null;
}
