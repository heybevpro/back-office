import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypeController } from './product-type.controller';
import { ProductTypeService } from '../service/product-type.service';
import { CreateProductTypeDto } from '../dto/create-product-type.dto';
import { ProductType } from '../entity/product-type.entity';
import { Venue } from '../../venue/entity/venue.entity';

describe('ProductTypeController', () => {
  let controller: ProductTypeController;
  let service: ProductTypeService;

  const mockProductTypeService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  const mockVenue: Venue = {
    id: 1,
    name: 'Venue A',
    product_types: [],
  } as unknown as Venue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductTypeController],
      providers: [
        {
          provide: ProductTypeService,
          useValue: mockProductTypeService,
        },
      ],
    }).compile();

    controller = module.get<ProductTypeController>(ProductTypeController);
    service = module.get<ProductTypeService>(ProductTypeService);
  });

  describe('create', () => {
    it('should create a new product type', async () => {
      const createProductTypeDto: CreateProductTypeDto = {
        name: '<_PRODUCT-TYPE-A_>',
        venue: 1,
      };
      const createdProductType: ProductType = {
        id: 'uuid',
        name: '<_PRODUCT-TYPE-A_>',
        venue: mockVenue,
        products: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(createdProductType);

      const result = await controller.create(createProductTypeDto);

      expect(service.create).toHaveBeenCalledWith(createProductTypeDto);
      expect(result).toEqual(createdProductType);
    });
  });

  describe('findAll', () => {
    it('should return a list of product types', async () => {
      const productTypes: ProductType[] = [
        {
          id: 'uuid1',
          name: '<_PRODUCT-TYPE-A_>',
          venue: mockVenue,
          created_at: new Date(),
          updated_at: new Date(),
          products: [],
        },
        {
          id: 'uuid2',
          name: '<_PRODUCT-TYPE-B_>',
          venue: mockVenue,
          created_at: new Date(),
          updated_at: new Date(),
          products: [],
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(productTypes);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(productTypes);
    });
  });
});
