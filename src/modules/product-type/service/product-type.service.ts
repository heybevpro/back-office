import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductType } from '../entity/product-type.entity';
import { CreateProductTypeDto } from '../dto/create-product-type.dto';

@Injectable()
export class ProductTypeService {
  constructor(
    @InjectRepository(ProductType)
    private readonly productTypeRepository: Repository<ProductType>,
  ) {}

  async create(
    createProductTypeDto: CreateProductTypeDto,
  ): Promise<ProductType> {
    const productType = this.productTypeRepository.create({
      name: createProductTypeDto.name,
      venue: { id: createProductTypeDto.venue },
    });
    return this.productTypeRepository.save(productType);
  }

  async findAll(): Promise<Array<ProductType>> {
    return this.productTypeRepository.find();
  }
}
