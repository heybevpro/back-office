import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypeService } from './product-type.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductType } from '../entity/product-type.entity';
import { CreateProductTypeDto } from '../dto/create-product-type.dto';
import { Venue } from '../../venue/entity/venue.entity';

describe('ProductTypeService', () => {
  let service: ProductTypeService;
  let repository: Repository<ProductType>;

  const mockProductTypeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockVenue: Venue = {
    id: 1,
    name: 'Venue A',
    product_types: [],
  } as unknown as Venue;

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
    const createdMockProductType = {
      id: 'uuid',
      name: '<_PRODUCT-TYPE_>',
      venue: mockVenue,
      products: [],
    };
    const createProductTypeDto: CreateProductTypeDto = {
      name: '<_PRODUCT-TYPE_>',
      venue: 1,
    };
    jest.spyOn(repository, 'create').mockReturnValue(createdMockProductType);
    jest.spyOn(repository, 'save').mockResolvedValue(createdMockProductType);

    const result = await service.create(createProductTypeDto);

    expect(repository.create).toHaveBeenCalledWith({
      name: createProductTypeDto.name,
      venue: { id: createProductTypeDto.venue },
    });
    expect(result).toEqual(createdMockProductType);
  });

  it('finds all product types', async () => {
    const mockProductTypes = [
      {
        id: 'uuid1',
        name: '<_PRODUCT-TYPE-A_>',
        venue: mockVenue,
        products: [],
      },
      {
        id: 'uuid2',
        name: '<_PRODUCT-TYPE-B_>',
        venue: mockVenue,
        products: [],
      },
    ];

    jest.spyOn(repository, 'find').mockResolvedValue(mockProductTypes);

    const result = await service.findAll();

    expect(repository.find).toHaveBeenCalled();
    expect(result).toEqual(mockProductTypes);
  });
});
