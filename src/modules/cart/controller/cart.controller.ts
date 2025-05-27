import { Controller, Param, Post } from '@nestjs/common';
// import { AddToCartDto, RemoveFromCartDto } from '../dto/create-cart.dto';
import { CartService } from '../service/cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // @Post(':employeeId/add')
  // addToCart(
  //   @Param('employeeId') employeeId: string,
  //   @Body() dto: AddToCartDto,
  // ) {
  //   return this.cartService.addToCart(employeeId, dto);
  // }

  // @Delete(':employeeId/remove')
  // removeFromCart(
  //   @Param('employeeId') employeeId: string,
  //   @Body() dto: RemoveFromCartDto,
  // ) {
  //   return this.cartService.removeFromCart(employeeId, dto);
  // }

  // @Get(':employeeId')
  // fetchCart(@Param('employeeId') employeeId: string) {
  //   return this.cartService.fetchCart(employeeId);
  // }

  @Post('addCart')
  addCart(@Param('employeeId') employeeId: string) {
    return this.cartService.getOrCreateCart(employeeId);
  }
}
