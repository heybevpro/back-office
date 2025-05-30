import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entity/cart.entity';
import { CartContent } from 'src/modules/cart-content/entity/cart-content.entity';
import { Employee } from 'src/modules/employee/entity/employee.entity';
import { AddToCartDto, RemoveFromCartDto } from '../dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartContent)
    private readonly contentRepository: Repository<CartContent>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async addToCart(cartId: number, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['content'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart with id ${cartId} not found`);
    }

    const existing = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.cart', 'cart')
      .leftJoinAndSelect('content.product', 'product')
      .where('cart.id = :cartId', { cartId })
      .andWhere('product.id = :productId', { productId: dto.productId })
      .getOne();

    // this logic or add and reduce logic? just setting the quantity sent?
    if (existing) {
      existing.quantity += dto.quantity;
      await this.contentRepository.save(existing);
    } else {
      const content = this.contentRepository.create({
        cart,
        product: { id: dto.productId },
        quantity: dto.quantity,
      });
      await this.contentRepository.save(content);
    }

    return this.fetchCart(cartId);
  }

  // TODO: create updateCart rather than add and remove
  async removeFromCart(cartId: number, dto: RemoveFromCartDto): Promise<Cart> {
    let cart: Cart | null;

    try {
      cart = await this.cartRepository.findOne({
        where: { id: cartId },
        relations: ['content'],
      });
    } catch (err) {
      throw new BadRequestException('Failed to retrieve cart from database', {
        cause: err,
      });
    }

    if (!cart) {
      throw new NotFoundException(`Cart with id ${cartId} not found`);
    }

    let existing: CartContent | null;

    try {
      // TODO: remove this complex query, call cart content service directly
      existing = await this.contentRepository
        .createQueryBuilder('content')
        .leftJoinAndSelect('content.cart', 'cart')
        .leftJoinAndSelect('content.product', 'product')
        .where('cart.id = :cartId', { cartId })
        .andWhere('product.id = :productId', { productId: dto.productId })
        .getOne();
    } catch (err) {
      throw new BadRequestException(
        'Database error while fetching cart content',
        {
          cause: err,
        },
      );
    }

    if (!existing) {
      throw new BadRequestException(
        `Product with id ${dto.productId} is not available in cart ${cartId}`,
      );
    }

    try {
      await this.contentRepository.remove(existing);
    } catch (err) {
      throw new BadRequestException('Failed to remove product from cart', {
        cause: err,
      });
    }

    try {
      return await this.fetchCart(cartId);
    } catch (err) {
      throw new BadRequestException('Failed to fetch updated cart', {
        cause: err,
      });
    }
  }

  async fetchCart(cartId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['content'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found for employee');
    }

    return cart;
  }

  async createCart(employeeId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { employee: { id: employeeId } },
      relations: ['employee'],
    });

    if (!cart) {
      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId },
      });
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      cart = this.cartRepository.create({ employee });
      await this.cartRepository.save(cart);
    }

    return cart;
  }
}
