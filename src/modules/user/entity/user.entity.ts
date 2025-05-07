import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../role/entity/role.entity';
import { Organization } from '../../organization/entity/organization.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Column('varchar', { length: 50 })
  first_name: string;

  @Column('varchar', { length: 50, default: null, nullable: true })
  last_name: string;

  @ManyToOne(() => Role, (role) => role.id, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  role: Role;

  @OneToOne(() => Organization, { onDelete: 'SET NULL' })
  @JoinColumn()
  organization: Organization;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
