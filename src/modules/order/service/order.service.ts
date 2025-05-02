import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entity/order.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { OrderStatus } from '../../../utils/constants/order.constants';
import { CreateTabDto } from '../dto/create-tab.dto';
import { CreateClosedOrderDto } from '../dto/create-closed-order.dto';
import { ProductService } from '../../product/service/product.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private readonly productService: ProductService,
  ) {}

  async getAllOrders(): Promise<Array<Order>> {
    return await this.orderRepository.find({
      where: { status: OrderStatus.OPEN },
    });
  }

  async getOrderById(id: string): Promise<Order> {
    return await this.orderRepository.findOneByOrFail({
      id,
    });
  }

  async getOpenOrderById(id: string): Promise<Order> {
    try {
      return await this.orderRepository.findOneByOrFail({
        id,
        status: OrderStatus.OPEN,
      });
    } catch (e) {
      if (e instanceof QueryFailedError)
        throw new NotFoundException('Order not found');
      throw e;
    }
  }

  async getAllClosedOrders(): Promise<Array<Order>> {
    return await this.orderRepository.find({
      where: { status: OrderStatus.CLOSED },
      order: { created_at: 'DESC' },
    });
  }

  async createTab(createTabDto: CreateTabDto): Promise<Order> {
    return await this.orderRepository.save(
      this.orderRepository.create(createTabDto),
    );
  }

  async createClosedOrder(
    createClosedOrderDto: CreateClosedOrderDto,
  ): Promise<Order> {
    await this.productService.validateAndUpdateItemQuantitiesFromOrder(
      createClosedOrderDto.details,
    );
    return await this.orderRepository.save(
      this.orderRepository.create({
        details: JSON.stringify(createClosedOrderDto.details),
        status: OrderStatus.CLOSED,
      }),
    );
  }

  async closeTab(id: string): Promise<Order> {
    const order = await this.getOpenOrderById(id);
    order.status = OrderStatus.CLOSED;
    return await this.orderRepository.save(order);
  }
}
