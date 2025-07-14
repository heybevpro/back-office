import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from '../service/order.service';
import { CreateTabDto } from '../dto/create-tab.dto';
import { Order } from '../entity/order.entity';
import { OrderStatus } from '../../../utils/constants/order.constants';
import { UpdateTabDto } from '../dto/update-tab.dto';

describe('OrderController', () => {
  let orderController: OrderController;
  let orderService: jest.Mocked<OrderService>;

  beforeEach(async () => {
    const mockOrderService = {
      getAllOrders: jest.fn(),
      getOrderById: jest.fn(),
      getAllClosedOrders: jest.fn(),
      createTab: jest.fn(),
      createClosedOrder: jest.fn(),
      closeTab: jest.fn(),
      updateTabDetails: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    orderController = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);
  });

  const mockOrder: Order = {
    id: '1',
    status: OrderStatus.OPEN,
    name: 'VALID-NAME',
    details: '',
    updated_at: new Date(),
    created_at: new Date(),
    orderItems: [],
  };

  it('should be defined', () => {
    expect(orderController).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should call OrderService.getAllOrders and return the result', async () => {
      const mockOrders: Array<Order> = [mockOrder];
      orderService.getAllOrders.mockResolvedValue(mockOrders);

      const result = await orderController.getAllOrders();

      expect(orderService.getAllOrders).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getOrderById', () => {
    it('should call OrderService.getOrderById with the correct ID and return the result', async () => {
      orderService.getOrderById.mockResolvedValue(mockOrder);

      const result = await orderController.getOrderById('1');

      expect(orderService.getOrderById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockOrder);
    });
  });

  describe('getAllClosedOrders', () => {
    it('should call OrderService.getAllClosedOrders and return the result', async () => {
      const mockOrders: Array<Order> = [mockOrder];
      orderService.getAllClosedOrders.mockResolvedValue(mockOrders);

      const result = await orderController.getAllClosedOrders();

      expect(orderService.getAllClosedOrders).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });
  });

  describe('createTab', () => {
    it('should call OrderService.createTab with the correct DTO and return the result', async () => {
      const createTabDto: CreateTabDto = {
        name: '<_VALID-TAB-NAME_>',
        details: '',
      };
      const mockTab = mockOrder;
      orderService.createTab.mockResolvedValue(mockTab);

      const result = await orderController.createTab(createTabDto);

      expect(orderService.createTab).toHaveBeenCalledWith(createTabDto);
      expect(result).toEqual(mockTab);
    });
  });

  describe('createClosedOrder', () => {
    it('should call OrderService.createClosedOrder with the correct DTO and return the result', async () => {
      const createClosedOrderDto = {
        name: 'Closed Order',
        details: [],
      };
      const mockClosedOrder = {
        id: 'CLOSED-ID',
        name: 'Closed Order',
        details: '',
        status: OrderStatus.CLOSED,
        created_at: new Date(),
        updated_at: new Date(),
        orderItems: [],
      };

      orderService.createClosedOrder.mockResolvedValue(mockClosedOrder);

      const result =
        await orderController.createClosedOrder(createClosedOrderDto);

      expect(orderService.createClosedOrder).toHaveBeenCalledWith(
        createClosedOrderDto,
      );
      expect(result).toEqual(mockClosedOrder);
    });
  });

  describe('closeTab', () => {
    it('should call OrderService.closeTab with the correct ID and return the result', async () => {
      await orderController.closeTab('TAB-ID');
      expect(orderService.closeTab).toHaveBeenCalledWith('TAB-ID');
    });
  });

  describe('updateTabDetails', () => {
    it('should call OrderService.updateTabDetails with the correct ID and return the result', async () => {
      const updateTabDto: UpdateTabDto = {
        details: 'VALID-DETAILS',
      };
      const mockTab = mockOrder;
      orderService.updateTabDetails.mockResolvedValue(mockTab);

      const result = await orderController.updateTabDetails(
        'TAB-ID',
        updateTabDto,
      );

      expect(orderService.updateTabDetails).toHaveBeenCalledWith(
        'TAB-ID',
        updateTabDto,
      );
      expect(result).toEqual(mockTab);
    });
  });
});
