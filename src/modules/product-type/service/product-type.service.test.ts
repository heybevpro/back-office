import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypeService } from './product-type.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductType } from '../entity/product-type.entity';
import { CreateProductTypeDto } from '../dto/create-product-type.dto';
import { Venue } from '../../venue/entity/venue.entity';
import { VenueService } from '../../venue/service/venue.service';
import { ServingSizeService } from '../../serving-size/service/serving-size.service';
import { ServingSize } from 'src/modules/serving-size/entity/serving-size.entity';

describe('ProductTypeService', () => {
  let service: ProductTypeService;
  let repository: Repository<ProductType>;

  const mockVenue: Venue = {
    id: 1,
    name: 'Venue A',
    product_types: [],
  } as unknown as Venue;

  const mockServingSize: ServingSize = {
    id: 'size-uuid',
    label: 'Regular',
    volume_in_ml: 500,
  } as unknown as ServingSize;

  const mockVenueService = {
    findOneById: jest.fn(() => Promise.resolve(mockVenue)),
  };

  const mockServingSizeService = {
    findOneById: jest.fn(() => Promise.resolve(mockServingSize)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductTypeService,
        {
          provide: getRepositoryToken(ProductType),
          useClass: Repository,
        },
        { provide: VenueService, useValue: mockVenueService },
        { provide: ServingSizeService, useValue: mockServingSizeService },
      ],
    }).compile();

    service = module.get<ProductTypeService>(ProductTypeService);
    repository = module.get<Repository<ProductType>>(
      getRepositoryToken(ProductType),
    );
  });

  describe('service', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('create', () => {
    it('creates a new product type', async () => {
      const createdMockProductType = {
        id: 'uuid',
        name: '<_PRODUCT-TYPE_>',
        venue: mockVenue,
        products: [],
        menuItems: [],
        serving_size: mockServingSize,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const createProductTypeDto: CreateProductTypeDto = {
        name: '<_PRODUCT-TYPE_>',
        venue: 1,
        serving_size: 'size-uuid',
      };
      jest.spyOn(repository, 'create').mockReturnValue(createdMockProductType);
      jest.spyOn(repository, 'save').mockResolvedValue(createdMockProductType);

      const result = await service.create(createProductTypeDto);

      expect(mockServingSizeService.findOneById).toHaveBeenCalledWith(
        'size-uuid',
      );
      expect(repository.create).toHaveBeenCalledWith({
        name: createProductTypeDto.name,
        venue: { id: createProductTypeDto.venue },
        serving_size: mockServingSize,
      });
      expect(result).toEqual(createdMockProductType);
    });
  });

  describe('findAll', () => {
    it('finds all product types', async () => {
      const mockProductTypes: Array<ProductType> = [
        {
          id: 'uuid1',
          name: '<_PRODUCT-TYPE-A_>',
          venue: mockVenue,
          created_at: new Date(),
          updated_at: new Date(),
          products: [],
          menuItems: [],
          serving_size: mockServingSize,
        },
        {
          id: 'uuid2',
          name: '<_PRODUCT-TYPE-B_>',
          venue: mockVenue,
          created_at: new Date(),
          updated_at: new Date(),
          products: [],
          serving_size: mockServingSize,
          menuItems: [],
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(mockProductTypes);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: { serving_size: true },
      });
      expect(result).toEqual(mockProductTypes);
    });
  });

  describe('findAllByVenue', () => {
    it('should return a list of product types for a given venue', async () => {
      const venueId = 1;
      const mockProductTypes: ProductType[] = [
        {
          id: 'uuid1',
          name: 'Product Type A',
          venue: mockVenue,
          created_at: new Date(),
          updated_at: new Date(),
          products: [],
          serving_size: mockServingSize,
          menuItems: [],
        },
        {
          id: 'uuid2',
          name: 'Product Type B',
          venue: mockVenue,
          created_at: new Date(),
          updated_at: new Date(),
          products: [],
          serving_size: mockServingSize,
          menuItems: [],
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(mockProductTypes);

      const result = await service.findAllByVenue(venueId);

      expect(repository.find).toHaveBeenCalledWith({
        relations: { venue: true, serving_size: true },
        select: {
          venue: { id: false },
          serving_size: {
            id: true,
            label: true,
            volume_in_ml: true,
          },
        },
        where: {
          venue: { id: venueId },
        },
      });
      expect(result).toEqual(mockProductTypes);
    });
  });
});
