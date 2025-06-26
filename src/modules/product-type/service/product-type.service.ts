import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductType } from '../entity/product-type.entity';
import { CreateProductTypeDto } from '../dto/create-product-type.dto';
import { VenueService } from '../../venue/service/venue.service';
import { ServingSizeService } from '../../serving-size/service/serving-size.service';

@Injectable()
export class ProductTypeService {
  constructor(
    @InjectRepository(ProductType)
    private readonly productTypeRepository: Repository<ProductType>,
    private readonly venueService: VenueService,
    private readonly servingSizeService: ServingSizeService,
  ) {}

  async create(
    createProductTypeDto: CreateProductTypeDto,
  ): Promise<ProductType> {
    const venue = await this.venueService.findOneById(
      createProductTypeDto.venue,
    );

    const servingSize = await this.servingSizeService.findOneById(
      createProductTypeDto.serving_size,
    );

    const productType = this.productTypeRepository.create({
      name: createProductTypeDto.name,
      venue: { id: venue.id },
      serving_size: servingSize,
    });
    return this.productTypeRepository.save(productType);
  }

  async findAll(): Promise<Array<ProductType>> {
    return this.productTypeRepository.find({
      relations: ['serving_size'],
    });
  }

  async findAllByVenue(venueId: number): Promise<Array<ProductType>> {
    return await this.productTypeRepository.find({
      relations: { venue: true, serving_size: true },
      select: {
        venue: { id: false },
        serving_size: { id: true, label: true, volume_in_ml: true },
      },
      where: {
        venue: { id: venueId },
      },
    });
  }
}
