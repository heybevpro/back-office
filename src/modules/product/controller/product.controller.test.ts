import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from '../service/product.service';
import { Product } from '../entity/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductQuantityDto } from '../dto/update-product-quantity.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findAllByProductType: jest.fn(),
    fetchInventory: jest.fn(),
    updateItemQuantity: jest.fn(),
    findAllByVenue: jest.fn(),
  };

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Product A',
      price: 100,
      quantity: 12,
    } as unknown as Product,
    {
      id: 2,
      name: 'Product B',
      price: 200,
      quantity: 7,
    } as unknown as Product,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(mockProducts);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const mockProduct: Product = {
        id: 1,
        name: 'Product A',
        price: 100,
      } as unknown as Product;
      const createProductDto: CreateProductDto = {
        name: 'Product A',
        price: 100,
        product_type: '<_VALID_PRODUCT-TYPE_>',
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockProduct);

      const result = await controller.create(createProductDto);

      expect(service.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAllByProductType', () => {
    it('should return a list of products', async () => {
      jest
        .spyOn(service, 'findAllByProductType')
        .mockResolvedValue(mockProducts);

      const result = await controller.findByProductType('<_PRODUCT-TYPE-ID_>');

      expect(service.findAllByProductType).toHaveBeenCalledWith(
        '<_PRODUCT-TYPE-ID_>',
      );
      expect(result).toEqual(mockProducts);
    });
  });

  describe('fetchInventory', () => {
    it('should return a list of products with their quantities in inventory', async () => {
      const productServiceFetchInventorySpy = jest.spyOn(
        service,
        'fetchInventory',
      );

      productServiceFetchInventorySpy.mockResolvedValue(mockProducts);
      const result = await controller.fetchInventory();
      expect(productServiceFetchInventorySpy).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('updateItemQuantity', () => {
    it('should call the update item quantity method in the service', async () => {
      const mockUpdateItemQuantityDto: UpdateProductQuantityDto = {
        quantity: 10,
        product: 'VALID-PRODUCT-ID',
      };
      await controller.updateItemQuantity(mockUpdateItemQuantityDto);
      expect(service.updateItemQuantity).toHaveBeenCalledWith(
        mockUpdateItemQuantityDto,
      );
    });
  });

  describe('findByVenue', () => {
    it('should return a list of products for a venue', async () => {
      jest.spyOn(service, 'findAllByVenue').mockResolvedValue(mockProducts);
      const result = await controller.findByVenue('1');
      expect(service.findAllByVenue).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockProducts);
    });
  });
});
