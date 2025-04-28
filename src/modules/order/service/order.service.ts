import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entity/order.entity';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrderStatus } from '../../../utils/constants/order.constants';
import { CreateTabDto } from '../dto/create-tab.dto';
import { CreateClosedOrderDto } from '../dto/create-closed-order.dto';
import { TabClosedSuccessFullyResponse } from '../../../utils/constants/api-response.constants';
import { ProductService } from '../../product/service/product.service';
import { Product } from '../../product/entity/product.entity';

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
    const productIdQuantityMap: Record<string, number> = {};
    const productsIds: Array<string> = createClosedOrderDto.details?.map(
      (product: Product) => {
        productIdQuantityMap[product.id] = product.quantity;
        return product.id;
      },
    );
    const productsToUpdate =
      await this.productService.findAllWithIds(productsIds);
    productsToUpdate.forEach((product) => {
      const quantity = productIdQuantityMap[product.id];
      if (quantity && product.quantity) {
        product.quantity -= quantity;
      }
    });
    await this.productService.updateMultipleProducts(productsToUpdate);
    return await this.orderRepository.save(
      this.orderRepository.create({
        details: JSON.stringify(createClosedOrderDto.details),
        status: OrderStatus.CLOSED,
      }),
    );
  }

  async closeTab(id: string): Promise<typeof TabClosedSuccessFullyResponse> {
    try {
      await this.orderRepository.update(
        { id: id, status: OrderStatus.OPEN },
        { status: OrderStatus.CLOSED },
      );
      return TabClosedSuccessFullyResponse;
    } catch (e: unknown) {
      throw new BadGatewayException('Failed to Close Tab', { cause: e });
    }
  }
}
