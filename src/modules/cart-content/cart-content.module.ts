import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartContent } from './entity/cart-content.entity';
import { CartContentService } from './service/cart-content.service';
import { CartContentController } from './controller/cart-content.controller';
import { Cart } from '../cart/entity/cart.entity';
import { Product } from '../product/entity/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartContent, Cart, Product])],
  providers: [CartContentService],
  exports: [CartContentService],
  controllers: [CartContentController],
})
export class CartContentModule {}
