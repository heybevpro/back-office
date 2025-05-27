import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartContent } from '../entity/cart-content.entity';
import { Cart } from 'src/modules/cart/entity/cart.entity';
import { CreateCartContentDto } from '../dto/create-cart-content.dto';
import { Product } from 'src/modules/product/entity/product.entity';

@Injectable()
export class CartContentService {
  constructor(
    @InjectRepository(CartContent)
    private readonly cartContentRepository: Repository<CartContent>,

    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findOneByCartId(cartId: number): Promise<CartContent> {
    const content = await this.cartContentRepository.findOne({
      where: { cart: { id: cartId } },
    });

    if (!content) {
      throw new NotFoundException(
        `Cart content not found for cartId: ${cartId}`,
      );
    }

    return content;
  }

  async addToCart(dto: CreateCartContentDto): Promise<CartContent> {
    const cart = await this.cartRepository.findOne({
      where: { id: dto.cartId },
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found with id: ${dto.cartId}`);
    }
    console.log('cart', cart);

    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    console.log('product', product);

    if (!product) {
      throw new NotFoundException(
        `Product not found with id: ${dto.productId}`,
      );
    }

    const content = this.cartContentRepository.create({
      cart,
      product,
      quantity: dto.quantity,
    });

    console.log('content', content);

    return await this.cartContentRepository.save(content);
  }

  async updateCartContent(id: number, quantity: number): Promise<CartContent> {
    const content = await this.cartContentRepository.findOne({ where: { id } });

    if (!content) {
      throw new NotFoundException(`Cart content not found with id: ${id}`);
    }

    content.quantity = quantity;
    return await this.cartContentRepository.save(content);
  }

  async removeCartContent(id: number): Promise<void> {
    const result = await this.cartContentRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Cart content not found with id: ${id}`);
    }
  }
}
