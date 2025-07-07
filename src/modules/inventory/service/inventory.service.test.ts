import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { Inventory } from '../entity/inventory.entity';
import { Product } from '../../product/entity/product.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductService } from '../../product/service/product.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryRepository: Repository<Inventory>;
  let productService: ProductService;

  const mockProductService = {
    findProductById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Inventory),
          useClass: Repository,
        },
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    inventoryRepository = module.get<Repository<Inventory>>(
      getRepositoryToken(Inventory),
    );
    productService = module.get<ProductService>(ProductService);
  });

  it('should update inventory successfully', async () => {
    const product = { id: 'product-id' } as Product;
    const inventory = { id: 1, quantity: 10, product } as Inventory;

    jest.spyOn(productService, 'findProductById').mockResolvedValue(product);
    jest
      .spyOn(inventoryRepository, 'findOneOrFail')
      .mockResolvedValue(inventory);
    jest
      .spyOn(inventoryRepository, 'save')
      .mockResolvedValue({ ...inventory, quantity: 20 });

    const result = await service.updateInventory({
      quantity: 20,
      product: 'product-id',
    });

    expect(result.quantity).toBe(20);
    expect(inventoryRepository.save).toHaveBeenCalledWith({
      ...inventory,
      quantity: 20,
    });
  });

  it('should throw NotFoundException if product does not exist', async () => {
    jest
      .spyOn(productService, 'findProductById')
      .mockRejectedValue(new NotFoundException());

    await expect(
      service.updateInventory({ quantity: 20, product: 'invalid-id' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if inventory does not exist', async () => {
    const product = { id: 'product-id' } as Product;

    jest.spyOn(productService, 'findProductById').mockResolvedValue(product);
    jest
      .spyOn(inventoryRepository, 'findOneOrFail')
      .mockRejectedValue(new NotFoundException());

    await expect(
      service.updateInventory({ quantity: 20, product: 'product-id' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for invalid quantity', async () => {
    const product = { id: 'product-id' } as Product;
    const inventory = { id: 1, quantity: 10, product } as Inventory;

    jest.spyOn(productService, 'findProductById').mockResolvedValue(product);
    jest
      .spyOn(inventoryRepository, 'findOneOrFail')
      .mockResolvedValue(inventory);
    jest
      .spyOn(inventoryRepository, 'save')
      .mockRejectedValue(new BadRequestException());
    await expect(
      service.updateInventory({ quantity: -5, product: 'product-id' }),
    ).rejects.toThrow(BadRequestException);
  });
});
