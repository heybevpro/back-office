import { Venue } from '../../venue/entity/venue.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Device {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Venue, (venue) => venue.devices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  venue: Venue;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
