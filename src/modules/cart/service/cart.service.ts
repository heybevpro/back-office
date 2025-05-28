import { Injectable, NotFoundException } from '@nestjs/common';
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
    console.log(cart, dto);

    if (!cart) {
      throw new NotFoundException(`Cart with id ${cartId} not found`);
    }

    // const existing = await this.contentRepository.findOne({
    //   where: { cart: { id: cartId }, product: { id: dto.productId } },
    // });

    // if (existing) {
    //   console.log('existing', existing.quantity, dto.quantity, existing.quantity + dto.quantity);
    //   existing.quantity += dto.quantity;
    //   console.log('existing', existing.quantity);
    //   await this.contentRepository.save(existing);
    // } else {
    //   const content = this.contentRepository.create({
    //     cart,
    //     product: { id: dto.productId },
    //     quantity: dto.quantity,
    //   });
    //   console.log('content', content);
    //   await this.contentRepository.save(content);
    // }

    return this.fetchCart(cartId);
  }

  async removeFromCart(cartId: number, dto: RemoveFromCartDto): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['content'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart with id ${cartId} not found`);
    }

    const existing = await this.contentRepository.findOne({
      where: { cart: { id: cartId }, product: { id: dto.productId } },
    });

    if (existing) {
      await this.contentRepository.remove(existing);
    }

    return this.fetchCart(cartId);
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
