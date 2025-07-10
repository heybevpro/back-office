import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Venue } from '../../venue/entity/venue.entity';
import { MenuItemIngredient } from './menu-item-ingredient.entity';

@Entity()
@Unique(['name', 'venue'])
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  image_url?: string;

  @ManyToOne(() => Venue, { nullable: false })
  venue: Venue;

  @OneToMany(() => MenuItemIngredient, (mip) => mip.menuItem, {
    cascade: true,
  })
  products: MenuItemIngredient[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
