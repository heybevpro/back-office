import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Venue } from '../../venue/entity/venue.entity';

@Entity()
export class ProductType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32 })
  name: string;

  @ManyToOne(() => Venue, (venue) => venue.product_types, { nullable: false })
  venue: Venue;
}
