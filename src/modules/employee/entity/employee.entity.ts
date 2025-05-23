import { Venue } from '../../venue/entity/venue.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  address_line1: string;

  @Column({ nullable: true })
  address_line2?: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @ManyToOne(() => Venue, (venue) => venue.employees, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  venue?: Venue;

  @Exclude()
  @Column({ unique: true, nullable: false })
  pin: string;

  @Column({ type: 'boolean', default: false })
  employee_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
