import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductQuantityDto } from '../dto/update-product-quantity.dto';
import { CustomCharge } from '../../../utils/constants/order.constants';
import {
  InsufficientStockException,
  OutOfStockException,
} from '../../../excpetions/order.exception';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      product_type: { id: createProductDto.product_type },
    });
    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: { product_type: true },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        created_at: true,
        updated_at: true,
        product_type: { id: true, name: true },
      },
      order: { name: 'ASC' },
    });
  }

  async findAllByProductType(productTypeId: string): Promise<Array<Product>> {
    return await this.productRepository.find({
      relations: { product_type: true },
      select: { product_type: { id: false } },
      where: {
        product_type: { id: productTypeId },
      },
      order: { name: 'ASC' },
    });
  }

  async findAllByVenue(venueId: string): Promise<Array<Product>> {
    return await this.productRepository.find({
      relations: {
        product_type: {
          serving_size: true,
          venue: true,
        },
      },
      where: { product_type: { venue: { id: Number(venueId) } } },
      order: { name: 'DESC' },
    });
  }

  async findAllWithIds(ids: Array<string>): Promise<Array<Product>> {
    return await this.productRepository.find({
      relations: { product_type: true },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        description: true,
        created_at: true,
        updated_at: true,
        product_type: { id: true, name: true },
      },
      where: { id: In(ids) },
    });
  }

  async fetchInventory(): Promise<Array<Product>> {
    return await this.productRepository.find({
      relations: { product_type: true },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        description: true,
        created_at: true,
        updated_at: true,
        product_type: { id: true, name: true },
      },
      order: { name: 'ASC' },
    });
  }

  async updateItemQuantity(
    updateProductQuantityDto: UpdateProductQuantityDto,
  ): Promise<Product> {
    try {
      const productToUpdate = await this.productRepository.findOneByOrFail({
        id: updateProductQuantityDto.product,
      });
      productToUpdate.quantity = updateProductQuantityDto.quantity;
      return await this.productRepository.save(productToUpdate);
    } catch (err) {
      throw new NotFoundException('Product not found', { cause: err });
    }
  }

  async updateMultipleProducts(
    updateMultipleProductsDto: Product[],
  ): Promise<Array<Product>> {
    try {
      return await this.productRepository.save(updateMultipleProductsDto);
    } catch (err: unknown) {
      throw new BadRequestException('Failed Up Update Product Quantity', {
        cause: err,
      });
    }
  }

  async validateAndUpdateItemQuantitiesFromOrder(
    orderDetails: Array<Product | CustomCharge>,
  ): Promise<Array<Product>> {
    const productIdQuantityMap: Record<string, number> = {};
    const productsIds: Array<string> = orderDetails.map((product: Product) => {
      productIdQuantityMap[product.id] = product.quantity;
      return product.id;
    });
    const productsToUpdate = await this.findAllWithIds(productsIds);
    productsToUpdate.forEach((product: Product) => {
      this.validateInventoryForProduct(
        product,
        productIdQuantityMap[product.id],
      );
      product.quantity = product.quantity - productIdQuantityMap[product.id];
    });
    return await this.updateMultipleProducts(productsToUpdate);
  }

  private validateInventoryForProduct(
    product: Product,
    requestedQuantity: number,
  ) {
    if (!product.quantity) throw new OutOfStockException(product.name);
    if (product.quantity < requestedQuantity)
      throw new InsufficientStockException(product.name);
  }
}
