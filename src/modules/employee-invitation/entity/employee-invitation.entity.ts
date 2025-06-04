import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Status } from '../../../utils/constants/employee.constants';
import { Venue } from '../../venue/entity/venue.entity';
import { IsEmail, IsOptional } from 'class-validator';
import { CreateEmployeeDto } from '../../employee/dto/create-employee.dto';

@Entity()
export class EmployeeInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsEmail()
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: false })
  pin: string;

  @Column({
    type: 'enum',
    enum: Status,
    nullable: false,
    default: Status.OnboardingPending,
  })
  status: Status;

  @ManyToOne(() => Venue, (venue) => venue.employees, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @IsOptional()
  @Column({ type: 'jsonb', nullable: true })
  userMetadata?: CreateEmployeeDto;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
