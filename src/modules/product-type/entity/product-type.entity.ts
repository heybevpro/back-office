import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Venue } from '../../venue/entity/venue.entity';
import { Product } from '../../product/entity/product.entity';
import { ProductServingSize } from '../../../utils/constants/product.constants';

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

  @Column({
    type: 'enum',
    enum: ProductServingSize,
    nullable: false,
    default: ProductServingSize.Pour,
  })
  serving_size: ProductServingSize;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
