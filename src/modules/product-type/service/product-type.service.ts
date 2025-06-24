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

    const servingSizes = await Promise.all(
      createProductTypeDto.serving_sizes.map((id) =>
        this.servingSizeService.findOneById(id),
      ),
    );

    const productType = this.productTypeRepository.create({
      name: createProductTypeDto.name,
      venue: { id: venue.id },
      serving_sizes: servingSizes,
    });
    return this.productTypeRepository.save(productType);
  }

  async findAll(): Promise<Array<ProductType>> {
    return this.productTypeRepository.find();
  }

  async findAllByVenue(venueId: number): Promise<Array<ProductType>> {
    return await this.productTypeRepository.find({
      relations: { venue: true },
      select: { venue: { id: false } },
      where: {
        venue: { id: venueId },
      },
    });
  }
}
