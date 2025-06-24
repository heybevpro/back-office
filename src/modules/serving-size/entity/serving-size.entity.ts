import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../../organization/entity/organization.entity';
import { ProductType } from '../../product-type/entity/product-type.entity';

@Entity()
export class ServingSize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32 })
  label: string;

  @Column({ type: 'float' })
  volume_in_ml: number;

  @OneToOne(() => Organization, (organization) => organization.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToMany(() => ProductType, (productType) => productType.serving_sizes)
  product_types: ProductType[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
