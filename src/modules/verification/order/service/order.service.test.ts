import { OrderService } from './order.service';
import { Repository } from 'typeorm';
import { Order } from '../entity/order.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderStatus } from '../../../../utils/constants/order.constants';
import { ImATeapotException } from '@nestjs/common';
import { CreateTabDto } from '../dto/create-tab.dto';

describe('OrderService', () => {
  let orderService: OrderService;
  let orderRepository: Repository<Order>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useClass: Repository,
        },
      ],
    }).compile();
    orderService = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(orderService).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should return all open orders', async () => {
      const mockOrders = [{ id: '1', status: OrderStatus.OPEN }] as Order[];
      const orderRepositoryFindSpy = jest.spyOn(orderRepository, 'find');
      orderRepositoryFindSpy.mockResolvedValue(mockOrders);

      const result = await orderService.getAllOrders();

      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { status: OrderStatus.OPEN },
      });
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getOrderById', () => {
    it('should return an order by ID', async () => {
      const orderRepositoryFindOneByOrFailSpy = jest.spyOn(
        orderRepository,
        'findOneByOrFail',
      );
      const mockOrder = { id: '1', status: OrderStatus.OPEN } as Order;

      orderRepositoryFindOneByOrFailSpy.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById('1');

      expect(orderRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: '1',
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw an error if order is not found', async () => {
      const orderRepositoryFindOneSpy = jest.spyOn(orderRepository, 'findOne');
      orderRepositoryFindOneSpy.mockRejectedValue(new ImATeapotException());

      await expect(orderService.getOrderById('invalid-id')).rejects.toThrow();
    });
  });

  describe('getAllClosedOrders', () => {
    it('should return all closed orders', async () => {
      const orderRepositoryFindSpy = jest.spyOn(orderRepository, 'find');
      const mockOrders = [{ id: '2', status: OrderStatus.CLOSED }] as Order[];
      orderRepositoryFindSpy.mockResolvedValue(mockOrders);

      const result = await orderService.getAllClosedOrders();

      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { status: OrderStatus.CLOSED },
      });
      expect(result).toEqual(mockOrders);
    });
  });

  describe('createTab', () => {
    it('should create and save a new tab', async () => {
      const mockTab: CreateTabDto = { name: 'Test Tab', details: {} as JSON };
      const mockTabOrder = {
        id: 'TAB-ID',
        name: 'Test Tab',
        details: {} as JSON,
        status: OrderStatus.OPEN,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const orderRepositoryCreateSpy = jest.spyOn(orderRepository, 'create');
      const orderRepositorySaveSpy = jest.spyOn(orderRepository, 'save');
      orderRepositoryCreateSpy.mockReturnValue(mockTabOrder);
      orderRepositorySaveSpy.mockResolvedValue(mockTabOrder);

      const result = await orderService.createTab(mockTab);

      expect(orderRepositoryCreateSpy).toHaveBeenCalledWith(mockTab);
      expect(orderRepositorySaveSpy).toHaveBeenCalledWith(mockTabOrder);
      expect(result).toEqual(mockTabOrder);
    });
  });
});
