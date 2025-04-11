import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypeController } from './product-type.controller';
import { ProductTypeService } from '../service/product-type.service';
import { CreateProductTypeDto } from '../dto/create-product-type.dto';
import { ProductType } from '../entity/product-type.entity';

describe('ProductTypeController', () => {
  let controller: ProductTypeController;
  let service: ProductTypeService;

  const mockProductTypeService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

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

  it('should create a new product type', async () => {
    const createProductTypeDto: CreateProductTypeDto = {
      name: '<_PRODUCT-TYPE-A_>',
    };
    const createdProductType: ProductType = {
      id: 'uuid',
      name: '<_PRODUCT-TYPE-A_>',
    };

    jest.spyOn(service, 'create').mockResolvedValue(createdProductType);

    const result = await controller.create(createProductTypeDto);

    expect(service.create).toHaveBeenCalledWith(createProductTypeDto);
    expect(result).toEqual(createdProductType);
  });

  it('should return a list of product types', async () => {
    const productTypes: ProductType[] = [
      { id: 'uuid1', name: '<_PRODUCT-TYPE-A_>' },
      { id: 'uuid2', name: '<_PRODUCT-TYPE-B_>' },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue(productTypes);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(productTypes);
  });
});
