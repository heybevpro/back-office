import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Venue } from '../../venue/entity/venue.entity';
import { Product } from '../../product/entity/product.entity';
import { ServingSize } from '../../serving-size/entity/serving-size.entity';

@Entity()
export class ProductType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32 })
  name: string;

  @ManyToOne(() => Venue, (venue) => venue.product_types, { nullable: false })
  venue: Venue;

  @OneToMany(() => Product, (product) => product.product_type)
  products: Array<Product>;

  @OneToOne(() => ServingSize, (servingSize) => servingSize.product_type)
  serving_size: ServingSize;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
