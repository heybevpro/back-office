import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';

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
    return this.productRepository.find({ relations: { product_type: true } });
  }

  async findAllByProductType(productTypeId: string): Promise<Array<Product>> {
    return await this.productRepository.find({
      relations: { product_type: true },
      select: { product_type: { id: false } },
      where: {
        product_type: { id: productTypeId },
      },
    });
  }
}
