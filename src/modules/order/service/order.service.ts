import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entity/order.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { OrderStatus } from '../../../utils/constants/order.constants';
import { CreateTabDto } from '../dto/create-tab.dto';
import { CreateClosedOrderDto } from '../dto/create-closed-order.dto';
import { ProductService } from '../../product/service/product.service';
import { UpdateTabDto } from '../dto/update-tab.dto';
import { MenuItem } from '../../menu-item/entity/menu-item.entity';
import {
  InsufficientStockException,
  OutOfStockException,
} from '../../../exceptions/order.exception';
import { InventoryService } from '../../inventory/service/inventory.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private readonly productService: ProductService,
    private readonly inventoryService: InventoryService,
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
    // await this.productService.validateAndUpdateItemQuantitiesFromOrder(
    //   createClosedOrderDto.details,
    // );
    const productsMap: Record<string, { total: number; used: number }> = {};
    createClosedOrderDto.details.map((menuItem: MenuItem) => {
      menuItem.ingredients.map((ingredient) => {
        if (!productsMap[ingredient.product.id]) {
          productsMap[ingredient.product.id] = {
            total: ingredient.product.inventory.quantity,
            used: ingredient.serving_size.volume_in_ml * ingredient.quantity,
          };
        } else {
          productsMap[ingredient.product.id] = {
            total: productsMap[ingredient.product.id].total,
            used:
              productsMap[ingredient.product.id].used +
              ingredient.serving_size.volume_in_ml * ingredient.quantity,
          };
        }
      });
    });

    Object.entries(productsMap).forEach(([productId, product]) => {
      if (product.total === 0) {
        throw new OutOfStockException('Product is out of stock');
      }
      if (product.used > product.total) {
        throw new InsufficientStockException(
          `Insufficient inventory for product ${productId}. Used: ${product.used}, Available: ${product.total}`,
        );
      }
    });

    await this.inventoryService.updateInventoryForProductMap(productsMap);

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

  async updateTabDetails(
    id: string,
    updateTabDto: UpdateTabDto,
  ): Promise<Order> {
    const order = await this.getOpenOrderById(id);
    order.details = JSON.stringify(updateTabDto.details);
    return await this.orderRepository.save(order);
  }
}
