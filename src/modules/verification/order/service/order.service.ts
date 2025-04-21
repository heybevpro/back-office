import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entity/order.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrderStatus } from '../../../../utils/constants/order.constants';
import { CreateTabDto } from '../dto/create-tab.dto';
import { CreateClosedOrderDto } from '../dto/create-closed-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
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

  async getAllClosedOrders(): Promise<Array<Order>> {
    return await this.orderRepository.find({
      where: { status: OrderStatus.CLOSED },
    });
  }

  async createTab(createTabDto: CreateTabDto): Promise<Order> {
    return await this.orderRepository.save(
      this.orderRepository.create(createTabDto),
    );
  }

  async createClosedOrder(createTabDto: CreateClosedOrderDto): Promise<Order> {
    return await this.orderRepository.save(
      this.orderRepository.create({
        ...createTabDto,
        status: OrderStatus.CLOSED,
      }),
    );
  }
}
