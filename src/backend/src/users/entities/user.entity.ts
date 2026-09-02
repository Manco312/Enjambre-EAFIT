import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @OneToOne('Member', 'user', { nullable: true })
  member: Member | null;
}
