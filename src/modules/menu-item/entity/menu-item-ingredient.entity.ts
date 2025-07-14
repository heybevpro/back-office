import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../product/entity/product.entity';
import { ServingSize } from '../../serving-size/entity/serving-size.entity';
import { MenuItem } from './menu-item.entity';

@Entity()
export class MenuItemIngredient {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Product, { nullable: false })
  product: Product;

  @Column({ type: 'int', unsigned: true, nullable: false })
  quantity: number;

  @ManyToOne(() => ServingSize, { nullable: false })
  serving_size: ServingSize;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.ingredients, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  menu_item: MenuItem;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
