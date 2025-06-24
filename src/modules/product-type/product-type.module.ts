import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './entity/product-type.entity';
import { ProductTypeService } from './service/product-type.service';
import { ProductTypeController } from './controller/product-type.controller';
import { VenueModule } from '../venue/venue.module';
import { ServingSizeModule } from '../serving-size/serving-size.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductType]),
    VenueModule,
    ServingSizeModule,
  ],
  providers: [ProductTypeService],
  controllers: [ProductTypeController],
})
export class ProductTypeModule {}
