import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './entity/product-type.entity';
import { ProductTypeService } from './service/product-type.service';
import { ProductTypeController } from './controller/product-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductType])],
  providers: [ProductTypeService],
  controllers: [ProductTypeController],
})
export class ProductTypeModule {}
