import { Module } from '@nestjs/common';
import { OrderItem } from './entity/order-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem])],
  controllers: [],
  providers: [],
})
export class OrderItemModule {}
