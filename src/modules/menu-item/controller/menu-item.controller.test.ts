import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemController } from './menu-item.controller';
import { MenuItemService } from '../service/menu-item.service';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { MenuItem } from '../entity/menu-item.entity';
import { AuthorizedRequest } from '../../../utils/constants/auth.constants';

describe('MenuItemController', () => {
  let controller: MenuItemController;
  let service: MenuItemService;

  const mockMenuItemService = {
    createMenuItemFromIngredients: jest.fn(),
    getMenuItemsByVenue: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<MenuItemController>(MenuItemController);
    service = module.get<MenuItemService>(MenuItemService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMenuItem', () => {
    it('should call service.createMenuItemFromIngredients and return the created menu item', async () => {
      const mockDto: CreateMenuItemDto = {
        name: 'Test Item',
        description: 'Test Description',
        price: 100,
        venue: 1,
        ingredients: [],
      };
      const mockRequest = {
        user: { organization: { id: 1 } },
      } as AuthorizedRequest;
      const mockImage = { originalname: 'test.jpg' } as Express.Multer.File;
      const mockMenuItem = new MenuItem();
      mockMenuItem.id = '1';
      mockMenuItem.name = 'Test Item';

      mockMenuItemService.createMenuItemFromIngredients.mockResolvedValue(
        mockMenuItem,
      );

      const result = await controller.createMenuItem(
        mockRequest,
        mockDto,
        mockImage,
      );

      expect(service.createMenuItemFromIngredients).toHaveBeenCalledWith(
        mockDto,
        mockRequest.user.organization.id,
        mockImage,
      );
      expect(result).toEqual(mockMenuItem);
    });
  });

  describe('getMenuItemsByVenue', () => {
    it('should call service.getMenuItemsByVenue and return the menu items', async () => {
      const venueId = 1;
      const mockMenuItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      mockMenuItemService.getMenuItemsByVenue.mockResolvedValue(mockMenuItems);

      const result = await controller.getMenuItemsByVenue(venueId);

      expect(service.getMenuItemsByVenue).toHaveBeenCalledWith(venueId);
      expect(result).toEqual(mockMenuItems);
    });
  });
});
