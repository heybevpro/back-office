import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemController } from './menu-item.controller';
import { MenuItemService } from '../service/menu-item.service';
import { MenuItem } from '../entity/menu-item.entity';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';

describe('MenuItemController', () => {
  let controller: MenuItemController;
  let service: MenuItemService;

  const mockMenuItemService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuItemController],
      providers: [
        {
          provide: MenuItemService,
          useValue: mockMenuItemService,
        },
      ],
    }).compile();

    controller = module.get<MenuItemController>(MenuItemController);
    service = module.get<MenuItemService>(MenuItemService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of menu items', async () => {
      const mockMenuItems: MenuItem[] = [
        {
          id: '1',
          name: 'Pizza',
          description: 'Cheese',
          venue: {},
          products: [],
          created_at: new Date(),
          updated_at: new Date(),
        } as unknown as MenuItem,
        {
          id: '2',
          name: 'Burger',
          description: 'Beef',
          venue: {},
          products: [],
          created_at: new Date(),
          updated_at: new Date(),
        } as unknown as MenuItem,
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockMenuItems);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockMenuItems);
    });
  });

  describe('create', () => {
    it('should create a new menu item', async () => {
      const mockMenuItem: MenuItem = {
        id: '1',
        name: 'Pizza',
        description: 'Cheese',
        venue: {},
        products: [],
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as MenuItem;
      const createMenuItemDto: CreateMenuItemDto = {
        name: 'Pizza',
        description: 'Cheese',
        venue_id: 1,
        products: [{ product_id: 'prod-1', quantity: 1 }],
      };
      jest.spyOn(service, 'create').mockResolvedValue(mockMenuItem);
      const result = await controller.create(createMenuItemDto);
      expect(service.create).toHaveBeenCalledWith(createMenuItemDto);
      expect(result).toEqual(mockMenuItem);
    });
  });
});
