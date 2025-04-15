import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../entity/product.entity';
import { Repository } from 'typeorm';
import { ProductType } from '../../product-type/entity/product-type.entity';
import { CreateProductDto } from '../dto/create-product.dto';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 100,
    description: 'Test Description',
    product_type: {} as ProductType,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      jest.spyOn(productRepository, 'create').mockReturnValue(mockProduct);
      jest.spyOn(productRepository, 'save').mockResolvedValue(mockProduct);
      const createProductDto: CreateProductDto = {
        name: '<_PRODUCT-NAME_>',
        product_type: '<_PRODUCT-TYPE_>',
        description: '<_PRODUCT-DESCRIPTION_>',
        price: 100,
      };
      const result = await service.create(createProductDto);
      expect(result).toEqual(mockProduct);
      expect(productRepository.save).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of products', async () => {
      const mockProducts = [mockProduct];
      jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);
      const result = await service.findAll();
      expect(result).toEqual(mockProducts);
      expect(productRepository.find).toHaveBeenCalled();
    });
  });
});
