import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from '../service/inventory.service';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { Inventory } from '../entity/inventory.entity';
import { Product } from '../../product/entity/product.entity';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventory: Inventory = {
    id: 1,
    quantity: 10,
    product: {
      id: 'product-id',
      name: 'Product Name',
      price: 100.0,
    } as Product,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: {
            updateInventory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);
  });

  it('should call updateInventory on the service with the correct parameters', async () => {
    const updateInventoryDto: UpdateInventoryDto = {
      quantity: 10,
      product: 'product-id',
    };

    jest.spyOn(service, 'updateInventory').mockResolvedValue(mockInventory);

    const result = await controller.updateInventory(updateInventoryDto);

    expect(service.updateInventory).toHaveBeenCalledWith(updateInventoryDto);
    expect(result).toEqual(mockInventory);
  });
});
