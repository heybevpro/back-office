import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypeService } from './product-type.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductType } from '../entity/product-type.entity';
import { CreateProductTypeDto } from '../dto/create-product-type.dto';

describe('ProductTypeService', () => {
  let service: ProductTypeService;
  let repository: Repository<ProductType>;

  const mockProductTypeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductTypeService,
        {
          provide: getRepositoryToken(ProductType),
          useValue: mockProductTypeRepository,
        },
      ],
    }).compile();

    service = module.get<ProductTypeService>(ProductTypeService);
    repository = module.get<Repository<ProductType>>(
      getRepositoryToken(ProductType),
    );
  });

  it('creates a new product type', async () => {
    const createdMockProductType = { id: 'uuid', name: '<_PRODUCT-TYPE_>' };
    const createProductTypeDto: CreateProductTypeDto = {
      name: '<_PRODUCT-TYPE_>',
    };
    jest.spyOn(repository, 'create').mockReturnValue(createdMockProductType);
    jest.spyOn(repository, 'save').mockResolvedValue(createdMockProductType);

    const result = await service.create(createProductTypeDto);

    expect(repository.create).toHaveBeenCalledWith(createProductTypeDto);
    expect(repository.save).toHaveBeenCalledWith(createdMockProductType);
    expect(result).toEqual(createdMockProductType);
  });

  it('finds all product types', async () => {
    const mockProductTypes = [
      { id: 'uuid1', name: '<_PRODUCT-TYPE-A_>' },
      { id: 'uuid2', name: '<_PRODUCT-TYPE-B_>' },
    ];

    jest.spyOn(repository, 'find').mockResolvedValue(mockProductTypes);

    const result = await service.findAll();

    expect(repository.find).toHaveBeenCalled();
    expect(result).toEqual(mockProductTypes);
  });
});
