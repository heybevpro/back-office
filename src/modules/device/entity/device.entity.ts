import { Venue } from '../../venue/entity/venue.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Device {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToOne(() => Venue, (venue) => venue.device)
  @JoinColumn()
  venue: Venue;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
