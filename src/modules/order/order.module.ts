import { OrderController } from './controller/order.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderService } from './service/order.service';
import { ProductModule } from '../product/product.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), ProductModule, InventoryModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [],
})
export class OrderModule {}
