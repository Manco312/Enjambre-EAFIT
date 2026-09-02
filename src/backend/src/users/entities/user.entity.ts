import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  //OneToOne,
} from 'typeorm';

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

  /*
  @OneToOne(() => Member, member => member.user)
  member: Member | null;
  */
}
