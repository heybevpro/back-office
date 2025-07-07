import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Organization } from '../../organization/entity/organization.entity';
import { ProductType } from '../../product-type/entity/product-type.entity';

@Entity()
@Unique(['label', 'organization'])
export class ServingSize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32 })
  label: string;

  @Column({ type: 'float' })
  volume_in_ml: number;

  @ManyToOne(() => Organization, (organization) => organization.serving_sizes, {
    nullable: false,
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @OneToMany(() => ProductType, (productType) => productType.serving_size)
  product_types: ProductType[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
