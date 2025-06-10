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
import { EmployeeInvitationStatus } from '../../../utils/constants/employee.constants';
import { Venue } from '../../venue/entity/venue.entity';
import { CreateEmployeeMetadataDto } from '../dto/employee-metadata.dto';

@Entity()
export class EmployeeInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: false })
  pin: string;

  @Column({
    type: 'enum',
    enum: EmployeeInvitationStatus,
    nullable: false,
    default: EmployeeInvitationStatus.Onboarding,
  })
  status: EmployeeInvitationStatus;

  @ManyToOne(() => Venue, (venue) => venue.employees, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @Column({ type: 'jsonb', nullable: true })
  userMetadata?: CreateEmployeeMetadataDto & { document?: string };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
