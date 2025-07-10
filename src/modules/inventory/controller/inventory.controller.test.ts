import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from '../service/inventory.service';
import { Inventory } from '../entity/inventory.entity';
import { Product } from '../../product/entity/product.entity';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: {
            getInventoryByVenueId: jest.fn(),
            updateInventoryForProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);
  });

  it('should call getInventoryByVenueId on the service with the correct parameters', async () => {
    const mockInventory = [
      {
        id: 1,
        quantity: 10,
        product: {
          id: 'product-id',
          name: 'Product Name',
          price: 100.0,
          venue: { id: 1 },
        } as Product,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ] as Inventory[];

    jest
      .spyOn(service, 'getInventoryByVenueId')
      .mockResolvedValue(mockInventory);

    const result = await controller.getInventoryByVenueId(1);

    expect(service.getInventoryByVenueId).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockInventory);
  });

  it('should return an empty array if no inventory is found for the venue ID', async () => {
    jest.spyOn(service, 'getInventoryByVenueId').mockResolvedValue([]);

    const result = await controller.getInventoryByVenueId(999);

    expect(service.getInventoryByVenueId).toHaveBeenCalledWith(999);
    expect(result).toEqual([]);
  });

  it('should call updateInventoryForVenue on the service with the correct parameters', async () => {
    const mockUpdateDto: UpdateInventoryDto = {
      quantity: 2000.12,
      product: 'PRODUCT_UUID',
    };
    const mockUpdatedInventory: Inventory = {
      id: 1,
      quantity: 10000,
      product: {} as Product,
      updated_at: new Date(),
      created_at: new Date(),
    };

    jest
      .spyOn(service, 'updateInventoryForProduct')
      .mockResolvedValue(mockUpdatedInventory);

    const result = await controller.updateProductInventory(mockUpdateDto);

    expect(service.updateInventoryForProduct).toHaveBeenCalledWith(
      mockUpdateDto,
    );
    expect(result).toEqual(mockUpdatedInventory);
  });
});
