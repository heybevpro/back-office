import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductQuantityDto } from '../dto/update-product-quantity.dto';

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
      return await this.productRepository.save(updateProductQuantityDto);
    } catch (e) {
      console.error(e);
      throw new NotFoundException('Product not found');
    }
  }
}
