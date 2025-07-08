import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemController } from './menu-item.controller';
import { MenuItemService } from '../service/menu-item.service';
import { MenuItem } from '../entity/menu-item.entity';
import { CreateMenuItemRawDto } from '../dto/create-menu-item.dto';
import { Venue } from 'src/modules/venue/entity/venue.entity';

describe('MenuItemController', () => {
  let controller: MenuItemController;
  let service: MenuItemService;

  const mockMenuItemService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findByVenue: jest.fn(),
  };

  const venueId = 1;
  const mockMenuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Coke',
      description: 'Chilled soft drink',
      venue: { id: venueId, name: 'Bar A' } as Venue,
      products: [],
      price: 10,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '2',
      name: 'Orange Juice',
      description: 'Freshly squeezed orange juice',
      venue: { id: venueId, name: 'Bar A' } as Venue,
      products: [],
      price: 10,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

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
      jest.spyOn(service, 'findAll').mockResolvedValue(mockMenuItems);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockMenuItems);
    });
  });

  describe('create', () => {
    it('should create a new menu item', async () => {
      const mockMenuItem: MenuItem = mockMenuItems[0];
      const createMenuItemDto: CreateMenuItemRawDto = {
        name: 'Coke',
        description: 'Chilled soft drink',
        venue_id: '1',
        price: '10',
        products: JSON.stringify([
          { product_id: '3d7dfea8-9e8d-4b2a-8c1e-123456789abc', quantity: 1 },
        ]),
      };
      jest.spyOn(service, 'create').mockResolvedValue(mockMenuItem);
      const result = await controller.create(createMenuItemDto);
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Coke',
          description: 'Chilled soft drink',
          venue_id: 1,
          products: [
            { product_id: '3d7dfea8-9e8d-4b2a-8c1e-123456789abc', quantity: 1 },
          ],
          price: '10.00',
        }),
        undefined,
      );
      expect(result).toEqual(mockMenuItem);
    });
  });

  describe('findByVenue', () => {
    it('should return menu items for a specific venue', async () => {
      jest.spyOn(service, 'findByVenue').mockResolvedValue(mockMenuItems);
      const result = await controller.findByVenue(venueId);
      expect(service.findByVenue).toHaveBeenCalledWith(venueId);
      expect(result).toEqual(mockMenuItems);
    });

    it('should return empty array when no menu items found for venue', async () => {
      const venueId = 999;
      const mockMenuItems: MenuItem[] = [];
      jest.spyOn(service, 'findByVenue').mockResolvedValue(mockMenuItems);
      const result = await controller.findByVenue(venueId);
      expect(service.findByVenue).toHaveBeenCalledWith(venueId);
      expect(result).toEqual(mockMenuItems);
    });
  });
});
