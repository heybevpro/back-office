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
import { MenuItemIngredient } from './menu-item-ingredient.entity';
import { ProductType } from '../../product-type/entity/product-type.entity';

@Entity()
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  price: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    default: null,
  })
  image_url?: string;

  @ManyToOne(() => Venue, (venue) => venue.menu_items, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  venue: Venue;

  @OneToMany(() => MenuItemIngredient, (ingredient) => ingredient.menu_item)
  ingredients: Array<MenuItemIngredient>;

  @ManyToOne(() => ProductType, (type) => type.menuItems, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  productType: ProductType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
