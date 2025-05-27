import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entity/cart.entity';
// import { CartContent } from 'src/modules/cart-content/entity/cart-content.entity';
import { Employee } from 'src/modules/employee/entity/employee.entity';
// import { AddToCartDto, RemoveFromCartDto } from '../dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    // @InjectRepository(CartContent)
    // private readonly contentRepository: Repository<CartContent>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  // async addToCart(employeeId: number, dto: AddToCartDto): Promise<Cart> {
  //   const cart = await this.getOrCreateCart(employeeId);

  //   const queryBuilder =
  //     this.cartContentRepository.createQueryBuilder('cartContent');

  //   const existing = await queryBuilder
  //     .innerJoin('cartContent.cart', 'cart')
  //     .where('cart.id = :cartId', { cartId: cart.id })
  //     .andWhere('cartContent.productId = :productId', {
  //       productId: dto.productId,
  //     })
  //     .getOne();

  //   // const existing = await this.contentRepository.findOne({
  //   //   where: { cart: { id: cart.id }, productId: dto.productId },
  //   // });

  //   if (existing) {
  //     existing.quantity += dto.quantity;
  //     await this.contentRepository.save(existing);
  //   } else {
  //     const content = this.contentRepository.create({
  //       cart,
  //       productId: dto.productId,
  //       quantity: dto.quantity,
  //     });
  //     await this.contentRepository.save(content);
  //   }

  //   return this.fetchCart(employeeId);
  // }

  // async removeFromCart(
  //   employeeId: number,
  //   dto: RemoveFromCartDto,
  // ): Promise<Cart> {
  //   const cart = await this.getOrCreateCart(employeeId);

  //   const existing = await this.contentRepository.findOne({
  //     where: { cart: { id: cart.id }, productId: dto.productId },
  //   });

  //   // if (existing) {
  //   //   await this.contentRepository.remove(existing);
  //   // }

  //   return this.fetchCart(employeeId);
  // }

  // async fetchCart(employeeId: number): Promise<Cart> {
  //   const cart = await this.cartRepository.findOne({
  //     where: { employee: { id: employeeId } },
  //     relations: ['content'],
  //   });

  //   if (!cart) {
  //     throw new NotFoundException('Cart not found for employee');
  //   }

  //   return cart;
  // }

  async getOrCreateCart(employeeId: string): Promise<Cart> {
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
