import { OrderService } from './order.service';
import { QueryFailedError, Repository } from 'typeorm';
import { Order } from '../entity/order.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderStatus } from '../../../utils/constants/order.constants';
import { ImATeapotException, NotFoundException } from '@nestjs/common';
import { CreateTabDto } from '../dto/create-tab.dto';
import { ProductService } from '../../product/service/product.service';

describe('OrderService', () => {
  let orderService: OrderService;
  let orderRepository: Repository<Order>;
  const mockProductService = {
    validateAndUpdateItemQuantitiesFromOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useClass: Repository,
        },
        {
          provide: ProductService,
          useValue: mockProductService,
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
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getOpenOrderById', () => {
    it('should return Order if found', async () => {
      const mockOrder = { id: 'VALID-ID', status: OrderStatus.OPEN } as Order;
      const orderRepositoryFindOneByOrFailSpy = jest.spyOn(
        orderRepository,
        'findOneByOrFail',
      );
      orderRepositoryFindOneByOrFailSpy.mockResolvedValue(mockOrder);

      await expect(orderService.getOpenOrderById('VALID-ID')).resolves.toEqual(
        mockOrder,
      );
    });

    it('should throw a NotFoundException if Query Fails', async () => {
      const orderRepositoryFindOneByOrFailSpy = jest.spyOn(
        orderRepository,
        'findOneByOrFail',
      );
      orderRepositoryFindOneByOrFailSpy.mockRejectedValue(
        new QueryFailedError('GENERATED-QUERY', [], new Error('Query Error')),
      );

      await expect(orderService.getOpenOrderById('INVALID-ID')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a the exception back if any other error is thrown', async () => {
      const orderRepositoryFindOneByOrFailSpy = jest.spyOn(
        orderRepository,
        'findOneByOrFail',
      );
      orderRepositoryFindOneByOrFailSpy.mockRejectedValue(
        new ImATeapotException(),
      );

      await expect(orderService.getOpenOrderById('INVALID-ID')).rejects.toThrow(
        ImATeapotException,
      );
    });
  });

  describe('createTab', () => {
    it('should create and save a new tab', async () => {
      const mockTab: CreateTabDto = { name: 'Test Tab', details: '' };
      const mockTabOrder = {
        id: 'TAB-ID',
        name: 'Test Tab',
        details: '',
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

  describe('closeTab', () => {
    it('should close the tab and return the update data', async () => {
      const mockOrder = {
        id: 'TAB-ID',
        name: 'Test Tab',
        details: '',
        status: OrderStatus.OPEN,
        created_at: new Date(),
        updated_at: new Date(),
      } as Order;

      const orderServiceGetOpenOrderByIdSpy = jest.spyOn(
        orderService,
        'getOpenOrderById',
      );

      orderServiceGetOpenOrderByIdSpy.mockResolvedValue(mockOrder);

      const orderRepositorySaveSpy = jest.spyOn(orderRepository, 'save');

      orderRepositorySaveSpy.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CLOSED,
      });

      const result = await orderService.closeTab('TAB-ID');

      expect(orderServiceGetOpenOrderByIdSpy).toHaveBeenCalledWith('TAB-ID');
      expect(orderRepositorySaveSpy).toHaveBeenCalledWith({
        ...mockOrder,
        status: OrderStatus.CLOSED,
      });
      expect(result).toEqual({ ...mockOrder, status: OrderStatus.CLOSED });
    });
  });
  describe('createClosedOrder', () => {
    it('should create and save a closed order', async () => {
      const mockClosedOrderDto = { details: [] };
      const mockClosedOrderResponse = {
        id: 'CLOSED-ID',
        name: null as unknown as string,
        details: '',
        status: OrderStatus.CLOSED,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const orderRepositoryCreateSpy = jest.spyOn(orderRepository, 'create');
      const orderRepositorySaveSpy = jest.spyOn(orderRepository, 'save');
      orderRepositoryCreateSpy.mockReturnValue(mockClosedOrderResponse);
      orderRepositorySaveSpy.mockResolvedValue(mockClosedOrderResponse);

      const result = await orderService.createClosedOrder(mockClosedOrderDto);

      expect(orderRepositoryCreateSpy).toHaveBeenCalledWith({
        ...mockClosedOrderDto,
        details: JSON.stringify(mockClosedOrderDto.details),
        status: OrderStatus.CLOSED,
      });
      expect(orderRepositorySaveSpy).toHaveBeenCalledWith(
        mockClosedOrderResponse,
      );
      expect(result).toEqual(mockClosedOrderResponse);
    });
  });
});
