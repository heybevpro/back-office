import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class VerificationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: 'varchar',
    length: 15,
  })
  phone_number: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  verification_code: string;

  @Column({
    nullable: false,
    type: 'timestamptz',
    default: new Date().setHours(new Date().getHours() + 6),
  })
  expires_at: Date;

  @CreateDateColumn('timestamptz')
  created_at: Date;

  @UpdateDateColumn('timestamptz')
  updated_at: Date;
}
