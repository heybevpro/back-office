import { CartContent } from '../../cart-content/entity/cart-content.entity';
import { Employee } from '../../employee/entity/employee.entity';
import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn()
  employee: Employee;

  @OneToMany(() => CartContent, (content) => content.cart, { cascade: true })
  content: CartContent[];

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
