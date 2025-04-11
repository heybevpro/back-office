import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './entity/product-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductType])],
  providers: [],
  controllers: [],
})
export class ProductTypeModule {}
