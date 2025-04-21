import { Test } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from '../service/order.service';

describe('OrderController', () => {
  let orderController: OrderController;
  const mockOrderService = {};

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
      controllers: [OrderController],
    }).compile();
    orderController = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(orderController).toBeDefined();
  });
});
