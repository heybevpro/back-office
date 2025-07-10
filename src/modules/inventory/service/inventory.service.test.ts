import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { Inventory } from '../entity/inventory.entity';
import { Repository } from 'typeorm';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { Product } from '../../product/entity/product.entity';
import { ProductNotFoundException } from '../../../excpetions/product.exception';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryRepository: Repository<Inventory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Inventory),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    inventoryRepository = module.get<Repository<Inventory>>(
      getRepositoryToken(Inventory),
    );
  });

  it('should return inventory for a given venue ID', async () => {
    const mockInventory = [
      { id: 1, quantity: 10, product: { id: 'product-id', venue: { id: 1 } } },
    ] as Inventory[];

    jest.spyOn(inventoryRepository, 'find').mockResolvedValue(mockInventory);

    const result = await service.getInventoryByVenueId(1);

    expect(result).toEqual(mockInventory);
    expect(inventoryRepository.find).toHaveBeenCalledWith({
      where: { product: { venue: { id: 1 } } },
      relations: { product: { venue: true } },
      order: { updated_at: 'DESC' },
    });
  });

  it('should return an empty array if no inventory is found for the venue ID', async () => {
    jest.spyOn(inventoryRepository, 'find').mockResolvedValue([]);

    const result = await service.getInventoryByVenueId(999);

    expect(result).toEqual([]);
    expect(inventoryRepository.find).toHaveBeenCalledWith({
      where: { product: { venue: { id: 999 } } },
      relations: { product: { venue: true } },
      order: { updated_at: 'DESC' },
    });
  });

  it('should update inventory for a given venue ID', async () => {
    const mockUpdateDto: UpdateInventoryDto = {
      quantity: 2000.12,
      product: 'PRODUCT_UUID',
    };
    const mockInventoryObject: Inventory = {
      id: 1,
      quantity: 10000,
      product: {} as Product,
      updated_at: new Date(),
      created_at: new Date(),
    };

    const mockInventoryObjectAfterUpdate: Inventory = {
      ...mockInventoryObject,
      quantity: 2000.12,
    };

    jest
      .spyOn(inventoryRepository, 'findOne')
      .mockResolvedValue(mockInventoryObject);
    jest.spyOn(inventoryRepository, 'save').mockResolvedValue({
      ...mockInventoryObject,
      quantity: mockUpdateDto.quantity,
    });

    const result = await service.updateInventoryForProduct(mockUpdateDto);

    expect(result).toEqual(mockInventoryObjectAfterUpdate);
    expect(inventoryRepository.findOne).toHaveBeenCalledWith({
      where: { product: { id: mockUpdateDto.product } },
      relations: { product: true },
    });
    expect(inventoryRepository.save).toHaveBeenCalledWith({
      ...mockInventoryObject,
      quantity: mockUpdateDto.quantity,
    });
  });

  it('should throw an error if no inventory is found for the venue ID', async () => {
    const mockUpdateDto: UpdateInventoryDto = {
      quantity: 2000.12,
      product: 'PRODUCT_UUID',
    };

    jest.spyOn(inventoryRepository, 'findOne').mockResolvedValue(null);

    await expect(
      service.updateInventoryForProduct(mockUpdateDto),
    ).rejects.toThrow(ProductNotFoundException);

    expect(inventoryRepository.findOne).toHaveBeenCalledWith({
      where: { product: { id: mockUpdateDto.product } },
      relations: { product: true },
    });
  });
});
