import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemService } from './menu-item.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenuItem } from '../entity/menu-item.entity';
import { ProductService } from '../../product/service/product.service';
import { ServingSizeService } from '../../serving-size/service/serving-size.service';
import { VenueService } from '../../venue/service/venue.service';
import { NotFoundException } from '@nestjs/common';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { ServingSizeOrganizationMismatchException } from '../../../excpetions/menuItem.exception';
import { ObjectStoreService } from '../../object-store/service/object-store.service';

const mockMenuItemRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  manager: {
    create: jest.fn(),
  },
});

const mockDto: CreateMenuItemDto = {
  name: 'Pizza',
  description: 'desc',
  venue_id: 1,
  products: [
    { product_id: 'p1', quantity: 1, custom_serving_size_id: 's1' },
    { product_id: 'p2', quantity: 2 },
  ],
};

const venueId = 1;
const mockMenuItems = [
  {
    id: '1',
    name: 'Coke',
    description: 'Chilled soft drink',
    venue: { id: venueId, name: 'Bar A' },
    products: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2',
    name: 'Orange Juice',
    description: 'Freshly squeezed orange juice',
    venue: { id: venueId, name: 'Bar A' },
    products: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const menuItemFindRelations = {
  relations: [
    'products',
    'products.product',
    'products.product.product_type',
    'products.product.product_type.serving_size',
    'products.customServingSize',
  ],
  order: { created_at: 'DESC' },
};

describe('MenuItemService', () => {
  let service: MenuItemService;
  let menuItemRepository: ReturnType<typeof mockMenuItemRepository>;
  let productService: ProductService;
  let servingSizeService: ServingSizeService;
  let venueService: VenueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemService,
        {
          provide: getRepositoryToken(MenuItem),
          useFactory: mockMenuItemRepository,
        },
        { provide: ProductService, useValue: { findAllWithIds: jest.fn() } },
        { provide: ServingSizeService, useValue: { findOneById: jest.fn() } },
        { provide: VenueService, useValue: { findOneById: jest.fn() } },
        {
          provide: ObjectStoreService,
          useValue: { uploadMenuItemImage: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MenuItemService>(MenuItemService);
    menuItemRepository = module.get(getRepositoryToken(MenuItem));
    productService = module.get(ProductService);
    servingSizeService = module.get(ServingSizeService);
    venueService = module.get(VenueService);
  });

  describe('create', () => {
    const venue = { id: 1, organization: { id: 2 } };
    const products = [{ id: 'p1' }, { id: 'p2' }];
    const servingSizes = [{ id: 's1', organization: { id: 2 } }];

    const menuItemProduct = {
      product: products[0],
      custom_serving_size: servingSizes[0],
      quantity: 1,
    };
    it('should create a menu item with products and serving sizes', async () => {
      const menuItem = { ...mockDto, venue, products: [menuItemProduct] };
      venueService.findOneById = jest.fn().mockResolvedValue(venue);
      productService.findAllWithIds = jest.fn().mockResolvedValue(products);
      servingSizeService.findOneById = jest
        .fn()
        .mockResolvedValue(servingSizes[0]);
      menuItemRepository.create.mockReturnValue(menuItem);
      menuItemRepository.manager.create.mockReturnValue(menuItemProduct);
      menuItemRepository.save.mockResolvedValue(menuItem);

      const result = await service.create(mockDto);
      expect(result).toEqual(menuItem);
      expect(menuItemRepository.save).toHaveBeenCalledWith(menuItem);
    });

    it('should create a menu item when no custom serving size ids are provided', async () => {
      const dto = {
        name: 'Coke',
        description: 'Chilled soft drink',
        venue_id: 1,
        products: [
          { product_id: 'p1', quantity: 1 },
          { product_id: 'p2', quantity: 2 },
        ],
      };
      const venue = { id: 1, organization: { id: 2 } };
      const products = [{ id: 'p1' }, { id: 'p2' }];
      const menuItemProduct = {
        product: products[0],
        custom_serving_size: undefined,
        quantity: 1,
      };
      const menuItem = { ...dto, venue, products: [menuItemProduct] };

      (venueService.findOneById as jest.Mock).mockResolvedValue(venue);
      (productService.findAllWithIds as jest.Mock).mockResolvedValue(products);
      menuItemRepository.create.mockReturnValue(menuItem);
      menuItemRepository.manager.create.mockReturnValue(menuItemProduct);
      menuItemRepository.save.mockResolvedValue(menuItem);

      const result = await service.create(dto);
      expect(result).toEqual(menuItem);
      expect(menuItemRepository.save).toHaveBeenCalledWith(menuItem);
    });

    it('should throw NotFoundException if venue not found', async () => {
      venueService.findOneById = jest.fn().mockResolvedValue(undefined);
      await expect(
        service.create({
          name: '',
          description: '',
          venue_id: 1,
          products: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product not found', async () => {
      venueService.findOneById = jest
        .fn()
        .mockResolvedValue({ id: 1, organization: { id: 2 } });
      productService.findAllWithIds = jest.fn().mockResolvedValue([]);
      menuItemRepository.create.mockReturnValue({});
      await expect(service.create(mockDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if serving size not found', async () => {
      venueService.findOneById = jest
        .fn()
        .mockResolvedValue({ id: 1, organization: { id: 2 } });
      productService.findAllWithIds = jest
        .fn()
        .mockResolvedValue([{ id: 'p1' }]);
      servingSizeService.findOneById = jest.fn().mockResolvedValue(undefined);
      menuItemRepository.create.mockReturnValue({});
      menuItemRepository.manager.create.mockReturnValue({});
      await expect(service.create(mockDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ServingSizeOrganizationMismatchException if serving size organization does not match venue organization', async () => {
      const dto = {
        ...mockDto,
        products: [
          { product_id: 'p1', quantity: 1, custom_serving_size_id: 's1' },
        ],
      };
      const venue = { id: 1, organization: { id: 2 } };
      const products = [{ id: 'p1' }];
      const servingSizes = [{ id: 's1', organization: { id: 99 } }]; // Different org id

      (venueService.findOneById as jest.Mock).mockResolvedValue(venue);
      (productService.findAllWithIds as jest.Mock).mockResolvedValue(products);
      (servingSizeService.findOneById as jest.Mock).mockResolvedValue(
        servingSizes[0],
      );
      menuItemRepository.create.mockReturnValue({});
      menuItemRepository.manager.create.mockReturnValue({});

      await expect(service.create(dto)).rejects.toThrow(
        ServingSizeOrganizationMismatchException,
      );
    });

    it('should throw NotFoundException if serving size organization is missing', async () => {
      const venue = { id: 1, organization: { id: 2 } };
      const products = [{ id: 'p1' }];
      const servingSizes = [{ id: 's1' }];
      venueService.findOneById = jest.fn().mockResolvedValue(venue);
      productService.findAllWithIds = jest.fn().mockResolvedValue(products);
      servingSizeService.findOneById = jest
        .fn()
        .mockResolvedValue(servingSizes[0]);
      menuItemRepository.create.mockReturnValue({});
      menuItemRepository.manager.create.mockReturnValue({});
      await expect(service.create(mockDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all menu items', async () => {
      const menuItems = [{ id: '1' }];
      menuItemRepository.find.mockResolvedValue(menuItems);
      const result = await service.findAll();
      expect(result).toEqual(menuItems);
      expect(menuItemRepository.find).toHaveBeenCalledWith(
        menuItemFindRelations,
      );
    });
  });

  describe('findOneById', () => {
    it('should return a menu item by id', async () => {
      menuItemRepository.findOne.mockResolvedValue(mockMenuItems[0]);
      const result = await service.findOneById('1');
      expect(result).toEqual(mockMenuItems[0]);
      expect(menuItemRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: menuItemFindRelations.relations,
      });
    });
    it('should throw NotFoundException if not found', async () => {
      menuItemRepository.findOne.mockResolvedValue(undefined);
      await expect(service.findOneById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMenuItemRecipe', () => {
    it('should call findOneById', async () => {
      const menuItem = { id: '1' } as MenuItem;
      jest.spyOn(service, 'findOneById').mockResolvedValue(menuItem);
      const result = await service.getMenuItemRecipe('1');
      expect(result).toEqual(menuItem);
      expect(service.findOneById).toHaveBeenCalledWith('1');
    });
  });

  describe('findByVenue', () => {
    it('should return menu items for a specific venue', async () => {
      menuItemRepository.find.mockResolvedValue(mockMenuItems);

      const result = await service.findByVenue(venueId);

      expect(result).toEqual(mockMenuItems);
      expect(menuItemRepository.find).toHaveBeenCalledWith({
        where: { venue: { id: venueId } },
        ...menuItemFindRelations,
      });
    });

    it('should return empty array when no menu items found for venue', async () => {
      const venueId = 999;
      const mockMenuItems: MenuItem[] = [];
      menuItemRepository.find.mockResolvedValue(mockMenuItems);

      const result = await service.findByVenue(venueId);

      expect(result).toEqual(mockMenuItems);
      expect(menuItemRepository.find).toHaveBeenCalledWith({
        where: { venue: { id: venueId } },
        ...menuItemFindRelations,
      });
    });
  });
});
