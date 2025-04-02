import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../../organization/entity/organization.entity';

@Entity()
export class Venue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @ManyToOne(() => Organization, (organization) => organization.venues, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  organization: Organization;

  @Column({ type: 'text', nullable: false })
  address: string;

  @Column({ type: 'varchar', length: 32, nullable: false })
  city: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  state: string;

  @Column({ type: 'varchar', length: 16, nullable: false })
  phone_number: string;

  @Column({ type: 'int', nullable: false })
  capacity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
