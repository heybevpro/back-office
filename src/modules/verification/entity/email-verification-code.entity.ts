import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class EmailVerificationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: 'varchar',
    length: 100,
  })
  email: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  verification_code: string;

  @Column({
    nullable: false,
    type: 'timestamp with time zone',
    default: `now() + interval '5 hours'`,
  })
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
