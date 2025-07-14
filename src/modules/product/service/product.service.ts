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
} from '../../../exceptions/order.exception';
import { InventoryService } from '../../inventory/service/inventory.service';
import { MenuItem } from '../../menu-item/entity/menu-item.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const inventoryEntity = this.inventoryService.getNewInventoryEntity();
    const product = this.productRepository.create({
      ...createProductDto,
      product_type: { id: createProductDto.product_type },
      venue: { id: createProductDto.venue },
      inventory: inventoryEntity,
    });
    return await this.productRepository.save(product);
  }

  async findAllForVenue(venueId: number): Promise<Product[]> {
    return this.productRepository.find({
      where: {
        venue: { id: venueId },
      },
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

  async findProductById(id: string): Promise<Product> {
    try {
      return await this.productRepository.findOneOrFail({
        where: { id },
      });
    } catch (err) {
      throw new NotFoundException(err);
    }
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
    orderDetails: Array<MenuItem | CustomCharge>,
  ): Promise<Array<Product>> {
    const productIdQuantityMap: Record<string, number> = {};
    const productsIds: Array<string> = [];
    orderDetails.forEach((item: MenuItem) => {
      item.ingredients.forEach((ingredient) => {
        if (!productIdQuantityMap[ingredient.product.id]) {
          productIdQuantityMap[ingredient.product.id] =
            ingredient.quantity * ingredient.serving_size.volume_in_ml;
          productsIds.push(ingredient.product.id);
        } else {
          productIdQuantityMap[ingredient.product.id] +=
            ingredient.quantity * ingredient.serving_size.volume_in_ml;
        }
      });
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
