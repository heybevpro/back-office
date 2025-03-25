import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role as RoleLevels } from '../../../utils/constants/role.constants';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: RoleLevels,
    unique: true,
    nullable: false,
  })
  role_name: RoleLevels;

  @CreateDateColumn('timestamptz')
  created_at: Date;

  @UpdateDateColumn('timestamptz')
  updated_at: Date;
}
