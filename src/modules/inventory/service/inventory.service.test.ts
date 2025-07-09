import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { Inventory } from '../entity/inventory.entity';
import { Repository } from 'typeorm';

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
});
