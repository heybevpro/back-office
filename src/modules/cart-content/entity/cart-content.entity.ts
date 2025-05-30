import { Cart } from '../../cart/entity/cart.entity';
import { Product } from '../../product/entity/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CartContent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.content, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @OneToOne(() => Product, { eager: true, nullable: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  quantity: number;
}
