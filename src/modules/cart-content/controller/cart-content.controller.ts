import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CartContentService } from '../service/cart-content.service';
import { CartContent } from '../entity/cart-content.entity';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { CreateCartContentDto } from '../dto/create-cart-content.dto';

@Controller('cart-content')
@UseGuards(JwtAuthGuard)
export class CartContentController {
  constructor(private readonly cartContentService: CartContentService) {}

  @Get(':id')
  async findByCartId(@Param('id') id: number): Promise<CartContent> {
    return await this.cartContentService.findOneByCartId(id);
  }

  @Post()
  async addToCart(@Body() dto: CreateCartContentDto): Promise<CartContent> {
    return await this.cartContentService.addToCart(dto);
  }
}
