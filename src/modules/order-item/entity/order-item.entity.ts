import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../order/entity/order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  order_item_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  order_item_price: number;

  @ManyToOne(() => Order, (order) => order.orderItems, {
    nullable: false,
    cascade: ['insert'],
    onDelete: 'CASCADE',
  })
  order: Order;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
