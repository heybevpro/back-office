import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Venue } from '../../venue/entity/venue.entity';
import { User } from '../../user/entity/user.entity';
import { OrganizationSize } from '../../../utils/constants/organization.constants';
import { ServingSize } from '../../serving-size/entity/serving-size.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  name: string;

  @Column({ type: 'text', nullable: false })
  address_line1: string;

  @Column({ type: 'text', nullable: true })
  address_line2: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  city: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  state: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  zip: string;

  @Column({ type: 'enum', enum: OrganizationSize, nullable: false })
  size: OrganizationSize;

  @OneToOne(() => User, (user) => user.organization)
  user: User;

  @OneToMany(() => Venue, (venue) => venue.organization)
  venues: Venue[];

  @OneToMany(() => ServingSize, (servingSize) => servingSize.organization)
  serving_sizes: ServingSize[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
