import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../entity/product.entity';
import { In, Repository } from 'typeorm';
import { ProductType } from '../../product-type/entity/product-type.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductQuantityDto } from '../dto/update-product-quantity.dto';
import {
  BadRequestException,
  ImATeapotException,
  NotFoundException,
} from '@nestjs/common';
import { Inventory } from '../../inventory/entity/inventory.entity';
import { Venue } from '../../venue/entity/venue.entity';
import { InventoryService } from '../../inventory/service/inventory.service';
import { MenuItem } from '../../menu-item/entity/menu-item.entity';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 100,
    description: 'Test Description',
    product_type: {} as ProductType,
    quantity: 1,
    created_at: new Date(),
    updated_at: new Date(),
    inventory: {} as Inventory,
    venue: {} as Venue,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
        {
          provide: InventoryService,
          useValue: {
            getNewInventoryEntity: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      jest.spyOn(productRepository, 'create').mockReturnValue(mockProduct);
      jest.spyOn(productRepository, 'save').mockResolvedValue(mockProduct);
      const createProductDto: CreateProductDto = {
        name: '<_PRODUCT-NAME_>',
        product_type: '<_PRODUCT-TYPE_>',
        description: '<_PRODUCT-DESCRIPTION_>',
        price: 100,
        venue: 1,
      };
      const result = await service.create(createProductDto);
      expect(result).toEqual(mockProduct);
      expect(productRepository.save).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('findAllForVenue', () => {
    it('should return a paginated list of products for given venue', async () => {
      const mockProducts = [mockProduct];
      jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);
      const result = await service.findAllForVenue(1);
      expect(result).toEqual(mockProducts);
      expect(productRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAllByProductType', () => {
    it('should return a paginated list of products', async () => {
      const mockProducts = [mockProduct];
      jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);
      const result = await service.findAllByProductType('<_PRODUCT-TYPE-ID_>');
      expect(result).toEqual(mockProducts);
      expect(productRepository.find).toHaveBeenCalledWith({
        relations: { product_type: true },
        select: { product_type: { id: false } },
        where: {
          product_type: { id: '<_PRODUCT-TYPE-ID_>' },
        },
        order: { name: 'ASC' },
      });
    });
  });

  describe('findAllWithIds', () => {
    it('should return a list of products', async () => {
      const mockProducts = [mockProduct];
      jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);
      expect(await service.findAllWithIds(['1'])).toBe(mockProducts);
    });

    it('should call the repository with the correct query options', async () => {
      const productRepositoryFindSpy = jest.spyOn(productRepository, 'find');
      productRepositoryFindSpy.mockResolvedValue([mockProduct]);
      await service.findAllWithIds(['1']);
      expect(productRepositoryFindSpy).toHaveBeenCalledWith({
        relations: { product_type: true, inventory: true },
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
          description: true,
          created_at: true,
          updated_at: true,
          product_type: { id: true, name: true },
        },
        where: { id: In(['1']) },
      });
    });
  });

  describe('fetchInventory', () => {
    it('should return a list of products', async () => {
      const mockProducts = [mockProduct];
      jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);
      expect(await service.fetchInventory()).toBe(mockProducts);
    });

    it('should call the repository with the correct query options', async () => {
      const productRepositoryFindSpy = jest.spyOn(productRepository, 'find');
      productRepositoryFindSpy.mockResolvedValue([mockProduct]);
      await service.fetchInventory();
      expect(productRepositoryFindSpy).toHaveBeenCalledWith({
        relations: { product_type: true },
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
          description: true,
          created_at: true,
          updated_at: true,
          product_type: { id: true, name: true },
        },
        order: { name: 'ASC' },
      });
    });
  });

  describe('updateItemQuantity', () => {
    it('should return a list of products', async () => {
      const mockUpdateProductQuantityDto: UpdateProductQuantityDto = {
        product: '1',
        quantity: 18,
      };
      const productRepositoryFindSpy = jest
        .spyOn(productRepository, 'findOneByOrFail')
        .mockResolvedValue(mockProduct);
      jest.spyOn(productRepository, 'save').mockResolvedValue({
        ...mockProduct,
        quantity: mockUpdateProductQuantityDto.quantity,
      });
      expect(
        await service.updateItemQuantity(mockUpdateProductQuantityDto),
      ).toEqual({
        ...mockProduct,
        quantity: mockUpdateProductQuantityDto.quantity,
      });
      expect(productRepositoryFindSpy).toHaveBeenCalled();
    });

    it('should throw a NotFoundError if update fails', async () => {
      const mockUpdateProductQuantityDto: UpdateProductQuantityDto = {
        product: '1',
        quantity: 18,
      };
      jest
        .spyOn(productRepository, 'findOneByOrFail')
        .mockRejectedValue(new ImATeapotException('Product not found'));
      await expect(
        service.updateItemQuantity(mockUpdateProductQuantityDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMultipleProducts', () => {
    it('should return a list of updated products products', async () => {
      const mockProductsToUpdate = [mockProduct];
      jest
        .spyOn(productRepository, 'save')
        .mockResolvedValue([mockProduct] as unknown as Product);
      expect(
        await service.updateMultipleProducts(mockProductsToUpdate),
      ).toEqual(mockProductsToUpdate);
    });

    it('should throw a BadRequestException if update fails', async () => {
      const mockProductsToUpdate = [mockProduct];
      jest
        .spyOn(productRepository, 'save')
        .mockRejectedValue(new ImATeapotException('Failed to update'));
      await expect(
        service.updateMultipleProducts(mockProductsToUpdate),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateAndUpdateItemQuantitiesFromOrder', () => {
    it('should update product quantities successfully', async () => {
      const orderDetails = [
        {
          id: '1',
          quantity: 5,
          ingredients: [
            {
              id: '12',
              product: { id: '1212' },
              serving_size: {
                volume_in_ml: 100,
              },
            },
          ],
          price: '12.99',
        } as unknown as MenuItem,
      ];
      jest.spyOn(service, 'findAllWithIds').mockResolvedValue([mockProduct]);
      jest
        .spyOn(service, 'updateMultipleProducts')
        .mockResolvedValue([mockProduct]);

      const result =
        await service.validateAndUpdateItemQuantitiesFromOrder(orderDetails);

      expect(result).toEqual([mockProduct]);
      expect(service.findAllWithIds).toHaveBeenCalledWith(['1212']);
      expect(service.updateMultipleProducts).toHaveBeenCalled();
    });

    it('should throw OutOfStockException if product quantity is zero', async () => {
      const orderDetails = [
        { id: '1', quantity: 15, ingredients: [] } as unknown as MenuItem,
      ];
      const outOfStockProduct = { ...mockProduct, quantity: 0 };
      jest
        .spyOn(service, 'findAllWithIds')
        .mockResolvedValue([outOfStockProduct]);

      await expect(
        service.validateAndUpdateItemQuantitiesFromOrder(orderDetails),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InsufficientStockException if requested quantity exceeds available stock', async () => {
      const orderDetails = [
        { id: '1', quantity: 15, ingredients: [] } as unknown as MenuItem,
      ];
      jest.spyOn(service, 'findAllWithIds').mockResolvedValue([mockProduct]);

      await expect(
        service.validateAndUpdateItemQuantitiesFromOrder(orderDetails),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
