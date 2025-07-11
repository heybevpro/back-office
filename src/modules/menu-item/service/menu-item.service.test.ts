import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemService } from './menu-item.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenuItem } from '../entity/menu-item.entity';
import { MenuItemIngredient } from '../entity/menu-item-ingredient.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { MenuItemIngredientDto } from '../dto/menu-item-ingredient.dto';
import {
  FailedToCreateMenuItem,
  FailedToCreateMenuItemIngredients,
} from '../../../exceptions/menu-item.exception';
import { Venue } from '../../venue/entity/venue.entity';
import { Product } from '../../product/entity/product.entity';
import { ServingSize } from '../../serving-size/entity/serving-size.entity';
import {
  ImATeapotException,
  UnprocessableEntityException,
} from '@nestjs/common';

describe('MenuItemService', () => {
  let service: MenuItemService;
  let menuItemRepository: Repository<MenuItem>;
  let menuItemIngredientRepository: Repository<MenuItemIngredient>;
  let queryRunner: jest.Mocked<QueryRunner>;

  const mockMenuItem: MenuItem = {
    id: '1',
    name: 'Test Menu Item',
    description: 'Test Description',
    price: 100,
    ingredients: [],
    created_at: new Date(),
    updated_at: new Date(),
    venue: { id: 1 } as Venue,
  };

  const mockMenuItemIngredient: MenuItemIngredient = {
    id: 1,
    product: { id: '1' } as Product,
    quantity: 2,
    serving_size: { id: '1' } as ServingSize,
    menu_item: { id: '1' } as MenuItem,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        create: jest.fn(),
        save: jest.fn(),
      },
    } as unknown as jest.Mocked<QueryRunner>;

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as DataSource;

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
          provide: DataSource,
          useValue: mockDataSource,
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMenuItemFromIngredients', () => {
    it('should create a menu item with ingredients', async () => {
      const dto: CreateMenuItemDto = {
        name: 'Pasta',
        description: 'Tasty',
        price: 10,
        venue: 1,
        ingredients: [{ product: 'prod1', quantity: 1, serving_size: 'size1' }],
      };

      const mockMenuItem: MenuItem = {
        id: 'MENU-ITEM-ID',
        created_at: new Date(),
        updated_at: new Date(),
        venue: { id: dto.venue } as Venue,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        ingredients: [],
      };
      const savedIngredients: MenuItemIngredient = {
        id: 1,
        product: { id: 'PRODUCT-ID-1' } as Product,
        quantity: 1,
        menu_item: { id: 'MENU-ITEM-ID' } as MenuItem,
        serving_size: {
          id: 'SERVING-SIZE-ID',
          label: 'SERVING-LABEL',
        } as ServingSize,
        updated_at: new Date(),
        created_at: new Date(),
      };

      const menuItemRepositoryCreateSpy = jest.spyOn(
        queryRunner.manager,
        'create',
      );
      menuItemRepositoryCreateSpy.mockReturnValue([mockMenuItem]);

      const menuItemRepositorySaveSpy = jest.spyOn(queryRunner.manager, 'save');
      menuItemRepositorySaveSpy.mockResolvedValue(mockMenuItem);

      const menuItemIngredientRepositoryCreateSpy = jest.spyOn(
        queryRunner.manager,
        'create',
      );
      menuItemIngredientRepositoryCreateSpy.mockReturnValue([savedIngredients]);

      const menuItemIngredientRepositorySaveSpy = jest.spyOn(
        menuItemIngredientRepository,
        'save',
      );
      menuItemIngredientRepositorySaveSpy.mockResolvedValue(savedIngredients);

      const result = await service.createMenuItemFromIngredients(dto);

      expect(result).toEqual(mockMenuItem);
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should throw an error if transaction fails', async () => {
      jest
        .spyOn(queryRunner.manager, 'save')
        .mockRejectedValue(new UnprocessableEntityException());
      const createMenuItemDto: CreateMenuItemDto = {
        name: 'Test Menu Item',
        description: 'Test Description',
        price: 100,
        venue: 1,
        ingredients: [],
      };

      await expect(
        service.createMenuItemFromIngredients(createMenuItemDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('createMenuItemEntity', () => {
    it('should create and save a menu item entity', async () => {
      jest.spyOn(menuItemRepository, 'create').mockReturnValue(mockMenuItem);
      jest.spyOn(menuItemRepository, 'save').mockResolvedValue(mockMenuItem);

      const createMenuItemDto: CreateMenuItemDto = {
        name: 'Test Menu Item',
        description: 'Test Description',
        price: 100,
        venue: 1,
        ingredients: [],
      };

      const result = await service.createMenuItemEntity(createMenuItemDto);
      expect(result).toEqual(mockMenuItem);
      expect(menuItemRepository.save).toHaveBeenCalledWith(mockMenuItem);
    });

    it('should throw FailedToCreateMenuItem if save fails', async () => {
      jest
        .spyOn(menuItemRepository, 'save')
        .mockRejectedValue(new Error('Failed'));

      const createMenuItemDto: CreateMenuItemDto = {
        name: 'Test Menu Item',
        description: 'Test Description',
        price: 100,
        venue: 1,
        ingredients: [],
      };

      await expect(
        service.createMenuItemEntity(createMenuItemDto),
      ).rejects.toThrow(FailedToCreateMenuItem);
    });

    it('should rollback if menu item creation fails', async () => {
      const dto: CreateMenuItemDto = {
        name: 'FailItem',
        description: 'This Item is supposed to fail',
        price: 10,
        venue: 1,
        ingredients: [],
      };

      const mockMenuItem: MenuItem = {
        id: 'MENU-ITEM-ID',
        created_at: new Date(),
        updated_at: new Date(),
        venue: { id: dto.venue } as Venue,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        ingredients: [],
      };

      const menuItemRepositoryCreateSpy = jest.spyOn(
        menuItemRepository,
        'create',
      );
      menuItemRepositoryCreateSpy.mockReturnValue(mockMenuItem);

      const menuItemRepositorySaveSpy = jest.spyOn(menuItemRepository, 'save');
      menuItemRepositorySaveSpy.mockRejectedValue(new ImATeapotException());

      await expect(
        service.createMenuItemFromIngredients(dto),
      ).rejects.toThrow();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should rollback if ingredient creation fails', async () => {
      const dto: CreateMenuItemDto = {
        name: 'Burger',
        description: 'Nice',
        price: 12,
        venue: 1,
        ingredients: [{ product: 'prod1', quantity: 1, serving_size: 'size1' }],
      };

      const mockMenuItem: MenuItem = {
        id: 'MENU-ITEM-ID',
        created_at: new Date(),
        updated_at: new Date(),
        venue: { id: dto.venue } as Venue,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        ingredients: [],
      };

      const savedIngredients: MenuItemIngredient = {
        id: 1,
        product: { id: 'PRODUCT-ID-1' } as Product,
        quantity: 1,
        menu_item: { id: 'MENU-ITEM-ID' } as MenuItem,
        serving_size: {
          id: 'SERVING-SIZE-ID',
          label: 'SERVING-LABEL',
        } as ServingSize,
        updated_at: new Date(),
        created_at: new Date(),
      };

      const menuItemRepositoryCreateSpy = jest.spyOn(
        queryRunner.manager,
        'create',
      );
      menuItemRepositoryCreateSpy.mockReturnValue([mockMenuItem]);

      const menuItemRepositorySaveSpy = jest.spyOn(menuItemRepository, 'save');
      menuItemRepositorySaveSpy.mockResolvedValue(mockMenuItem);

      jest
        .spyOn(queryRunner.manager, 'create')
        .mockReturnValue([savedIngredients]);
      jest
        .spyOn(queryRunner.manager, 'save')
        .mockResolvedValueOnce(mockMenuItem);
      jest
        .spyOn(queryRunner.manager, 'save')
        .mockRejectedValue(new FailedToCreateMenuItemIngredients({}));

      await expect(service.createMenuItemFromIngredients(dto)).rejects.toThrow(
        FailedToCreateMenuItemIngredients,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('createMenuItemIngredients', () => {
    it('should create and save menu item ingredients', async () => {
      jest
        .spyOn(menuItemIngredientRepository, 'create')
        .mockReturnValue(mockMenuItemIngredient);
      jest
        .spyOn(menuItemIngredientRepository, 'save')
        .mockResolvedValue(mockMenuItemIngredient);

      const menuItemIngredients: MenuItemIngredientDto[] = [
        {
          product: 'PRODUCT-ID',
          quantity: 2,
          serving_size: 'SERVING-SIZE-ID',
        },
      ];

      const result = await service.createMenuItemIngredients(
        menuItemIngredients,
        '1',
      );
      expect(result).toEqual(mockMenuItemIngredient);
      expect(menuItemIngredientRepository.save).toHaveBeenCalled();
    });

    it('should throw FailedToCreateMenuItemIngredients if save fails', async () => {
      jest
        .spyOn(menuItemIngredientRepository, 'save')
        .mockRejectedValue(new Error('Failed'));

      const menuItemIngredients: MenuItemIngredientDto[] = [
        {
          product: 'PRODUCT-ID',
          quantity: 2,
          serving_size: 'SERVING-SIZE-ID',
        },
      ];

      await expect(
        service.createMenuItemIngredients(menuItemIngredients, '1'),
      ).rejects.toThrow(FailedToCreateMenuItemIngredients);
    });
  });

  describe('getMenuItemsByVenue', () => {
    it('should return menu items for a given venue', async () => {
      const mockMenuItems = [mockMenuItem];
      jest.spyOn(menuItemRepository, 'find').mockResolvedValue(mockMenuItems);

      const result = await service.getMenuItemsByVenue(1);
      expect(result).toEqual(mockMenuItems);
      expect(menuItemRepository.find).toHaveBeenCalledWith({
        where: { venue: { id: 1 } },
        order: { name: 'ASC' },
      });
    });
  });
});
