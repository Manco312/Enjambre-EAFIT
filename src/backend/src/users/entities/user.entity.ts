import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Group } from '../../groups/entities/group.entity.js';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  // Nunca se serializa en las respuestas (requiere ClassSerializerInterceptor,
  // activado en UsersController).
  @Exclude()
  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  role: string;

  @OneToOne('Group', 'user', { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ referencedColumnName: 'id' })
  group: Group | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
