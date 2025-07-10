import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemService } from './menu-item.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenuItem } from '../entity/menu-item.entity';
import { MenuItemIngredient } from '../entity/menu-item-ingredient.entity';
import { Repository } from 'typeorm';
import { ProductService } from '../../product/service/product.service';
import { ServingSizeService } from '../../serving-size/service/serving-size.service';
import { VenueService } from '../../venue/service/venue.service';
import { ObjectStoreService } from '../../object-store/service/object-store.service';
import { NotFoundException } from '@nestjs/common';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import {
  DuplicateMenuItemNameException,
  ServingSizeOrganizationMismatchException,
} from '../../../excpetions/menuItem.exception';
import { Product } from '../../product/entity/product.entity';
import { ServingSize } from '../../serving-size/entity/serving-size.entity';
import { Venue } from '../../venue/entity/venue.entity';
import { Organization } from '../../organization/entity/organization.entity';
import { ProductType } from 'src/modules/product-type/entity/product-type.entity';

describe('MenuItemService', () => {
  let service: MenuItemService;
  let menuItemRepository: Repository<MenuItem>;
  let menuItemIngredientRepository: Repository<MenuItemIngredient>;
  let productService: ProductService;
  let servingSizeService: ServingSizeService;
  let venueService: VenueService;
  let objectStoreService: ObjectStoreService;

  const mockOrganization: Organization = {
    id: 1,
    name: 'Test Org',
  } as Organization;

  const mockVenue: Venue = {
    id: 1,
    name: 'Test Venue',
    organization: mockOrganization,
    address: '',
    city: '',
    state: '',
    phone_number: '',
    capacity: 100,
    employees: [],
    devices: [],
    product_types: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockServingSize: ServingSize = {
    id: 'ss-1',
    label: 'Standard',
    volume_in_ml: 100,
    organization: mockOrganization,
    product_types: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockProductType: ProductType = {
    id: 'prod-type-1',
    name: 'Vodka',
    serving_size: mockServingSize,
    venue: mockVenue,
    products: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Vodka',
    price: 25.99,
    description: 'Premium vodka',
    product_type: mockProductType,
    quantity: 1000,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockMenuItem: MenuItem = {
    id: 'menu-1',
    name: 'Vodka Martini',
    description: 'Classic cocktail',
    price: 12.99,
    venue: mockVenue,
    products: [],
    image_url: undefined,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateDto: CreateMenuItemDto = {
    name: 'Vodka Martini',
    description: 'Classic cocktail',
    venue_id: 1,
    price: '12.99',
    products: [
      { product_id: 'prod-1', quantity: 2, serving_size_id: 'ss-1' },
      { product_id: 'prod-2', quantity: 1 },
    ],
  };

  const menuItemFindRelations = {
    relations: {
      products: {
        product: {
          product_type: {
            serving_size: true,
          },
        },
        servingSize: true,
      },
    },
    order: { created_at: 'DESC' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemService,
        {
          provide: getRepositoryToken(MenuItem),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(MenuItemIngredient),
          useClass: Repository,
        },
        {
          provide: ProductService,
          useValue: {
            findAllWithIds: jest.fn(),
          },
        },
        {
          provide: ServingSizeService,
          useValue: {
            findAllWithIds: jest.fn(),
          },
        },
        {
          provide: VenueService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: ObjectStoreService,
          useValue: {
            uploadDocument: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenuItemService>(MenuItemService);
    menuItemRepository = module.get<Repository<MenuItem>>(
      getRepositoryToken(MenuItem),
    );
    menuItemIngredientRepository = module.get<Repository<MenuItemIngredient>>(
      getRepositoryToken(MenuItemIngredient),
    );
    productService = module.get<ProductService>(ProductService);
    servingSizeService = module.get<ServingSizeService>(ServingSizeService);
    venueService = module.get<VenueService>(VenueService);
    objectStoreService = module.get<ObjectStoreService>(ObjectStoreService);

    jest.spyOn(menuItemRepository, 'create').mockReturnValue(mockMenuItem);
    jest.spyOn(menuItemRepository, 'save').mockResolvedValue(mockMenuItem);
    jest.spyOn(menuItemRepository, 'findOne').mockResolvedValue(null);
    jest
      .spyOn(menuItemIngredientRepository, 'create')
      .mockImplementation((ing) => ({
        ...ing,
        id: 'ing-1',
        created_at: new Date(),
        updated_at: new Date(),
        menuItem: mockMenuItem,
        product: mockProduct,
        servingSize: mockServingSize,
        quantity: 1,
      }));
  });

  describe('create', () => {
    it('should successfully create a menu item', async () => {
      venueService.findOneById = jest.fn().mockResolvedValue(mockVenue);
      productService.findAllWithIds = jest
        .fn()
        .mockResolvedValue([mockProduct]);
      servingSizeService.findAllWithIds = jest
        .fn()
        .mockResolvedValue([mockServingSize]);

      const result = await service.create(mockCreateDto);

      expect(result).toEqual(mockMenuItem);
      expect(venueService.findOneById).toHaveBeenCalledWith(
        mockCreateDto.venue_id,
      );
      expect(productService.findAllWithIds).toHaveBeenCalledWith(
        expect.arrayContaining(['prod-1', 'prod-2']),
      );
      expect(menuItemRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when venue does not exist', async () => {
      venueService.findOneById = jest.fn().mockResolvedValue(null);

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw DuplicateMenuItemNameException when name exists in venue', async () => {
      venueService.findOneById = jest.fn().mockResolvedValue(mockVenue);
      jest.spyOn(menuItemRepository, 'findOne').mockResolvedValue(mockMenuItem);

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        DuplicateMenuItemNameException,
      );
    });

    it('should throw ServingSizeOrganizationMismatchException when serving size org mismatch', async () => {
      const wrongOrgServingSize = {
        ...mockServingSize,
        organization: { id: 999, name: 'Wrong Org' },
      };

      venueService.findOneById = jest.fn().mockResolvedValue(mockVenue);
      productService.findAllWithIds = jest
        .fn()
        .mockResolvedValue([mockProduct]);
      servingSizeService.findAllWithIds = jest
        .fn()
        .mockResolvedValue([wrongOrgServingSize]);

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        ServingSizeOrganizationMismatchException,
      );
    });

    it('should handle menu item creation without serving sizes', async () => {
      const dtoWithoutServingSizes = {
        ...mockCreateDto,
        products: mockCreateDto.products.map((p) => ({
          product_id: p.product_id,
          quantity: p.quantity,
        })),
      };

      venueService.findOneById = jest.fn().mockResolvedValue(mockVenue);
      productService.findAllWithIds = jest
        .fn()
        .mockResolvedValue([mockProduct]);
      servingSizeService.findAllWithIds = jest
        .fn()
        .mockResolvedValue([mockServingSize]);

      servingSizeService.findAllWithIds = jest.fn().mockResolvedValue([]);

      const result = await service.create(dtoWithoutServingSizes);
      expect(result).toEqual(mockMenuItem);
    });

    it('should handle image upload when provided', async () => {
      const mockImage = {
        buffer: Buffer.from('test'),
        mimetype: 'image/png',
        originalname: 'test.png',
      };
      const mockImageUrl = 'http://example.com/image.png';

      venueService.findOneById = jest.fn().mockResolvedValue(mockVenue);
      productService.findAllWithIds = jest
        .fn()
        .mockResolvedValue([mockProduct]);
      servingSizeService.findAllWithIds = jest
        .fn()
        .mockResolvedValue([mockServingSize]);
      objectStoreService.uploadDocument = jest
        .fn()
        .mockResolvedValue(mockImageUrl);

      const mockMenuItemWithImage = {
        ...mockMenuItem,
        image_url: mockImageUrl,
      };
      jest
        .spyOn(menuItemRepository, 'save')
        .mockResolvedValue(mockMenuItemWithImage);

      const result = await service.create(mockCreateDto, mockImage);

      expect(result).toMatchObject(mockMenuItemWithImage);
      expect(objectStoreService.uploadDocument).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all menu items', async () => {
      const mockMenuItems = [mockMenuItem, mockMenuItem];
      jest.spyOn(menuItemRepository, 'find').mockResolvedValue(mockMenuItems);

      const result = await service.findAll();

      expect(result).toEqual(mockMenuItems);
      expect(menuItemRepository.find).toHaveBeenCalledWith({
        ...menuItemFindRelations,
      });
    });

    it('should return empty array when no menu items exist', async () => {
      jest.spyOn(menuItemRepository, 'find').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOneById', () => {
    it('should return a menu item by id', async () => {
      jest
        .spyOn(menuItemRepository, 'findOneOrFail')
        .mockResolvedValue(mockMenuItem);

      const result = await service.findOneById('menu-1');

      expect(result).toEqual(mockMenuItem);
      expect(menuItemRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 'menu-1' },
        relations: menuItemFindRelations.relations,
      });
    });

    it('should throw NotFoundException when menu item not found', async () => {
      jest
        .spyOn(menuItemRepository, 'findOneOrFail')
        .mockRejectedValue(new Error());

      await expect(service.findOneById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByVenue', () => {
    it('should return menu items for a venue', async () => {
      const mockMenuItems = [mockMenuItem];
      jest.spyOn(menuItemRepository, 'find').mockResolvedValue(mockMenuItems);

      const result = await service.findByVenue(1);

      expect(result).toEqual(mockMenuItems);
      expect(menuItemRepository.find).toHaveBeenCalledWith({
        where: { venue: { id: 1 } },
        ...menuItemFindRelations,
      });
    });

    it('should return empty array when no menu items for venue', async () => {
      jest.spyOn(menuItemRepository, 'find').mockResolvedValue([]);

      const result = await service.findByVenue(999);

      expect(result).toEqual([]);
    });
  });
});
