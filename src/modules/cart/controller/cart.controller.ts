import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AddToCartDto, RemoveFromCartDto } from '../dto/create-cart.dto';
import { CartService } from '../service/cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post(':cartId/add')
  addToCart(@Param('cartId') cartId: number, @Body() dto: AddToCartDto) {
    console.log(dto);
    return this.cartService.addToCart(cartId, dto);
  }

  @Delete(':cartId/remove')
  removeFromCart(
    @Param('cartId') cartId: number,
    @Body() dto: RemoveFromCartDto,
  ) {
    return this.cartService.removeFromCart(cartId, dto);
  }

  @Get(':cartId')
  fetchCart(@Param('cartId') cartId: number) {
    return this.cartService.fetchCart(cartId);
  }

  @Post('createCart')
  createCart(@Param('employeeId') employeeId: string) {
    return this.cartService.createCart(employeeId);
  }
}
