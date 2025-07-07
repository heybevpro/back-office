import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductType } from '../../product-type/entity/product-type.entity';
import { Inventory } from '../../inventory/entity/inventory.entity';
import { Venue } from '../../venue/entity/venue.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column('text', { nullable: true, default: null })
  description: string;

  @ManyToOne(() => ProductType, (productType) => productType.products, {
    nullable: false,
  })
  product_type: ProductType;

  @OneToOne(() => Inventory, (inventory) => inventory.product, {
    onDelete: 'RESTRICT',
  })
  inventory: Inventory;

  @ManyToOne(() => Venue, (venue) => venue.products)
  venue: Venue;

  @Column({ type: 'int', default: 0, nullable: false })
  quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
