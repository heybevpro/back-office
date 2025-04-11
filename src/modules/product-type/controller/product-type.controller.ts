import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ProductTypeService } from '../service/product-type.service';
import { CreateProductTypeDto } from '../dto/create-product-type.dto';
import { ProductType } from '../entity/product-type.entity';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';

@Controller('product-type')
@UseGuards(JwtAuthGuard)
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}

  @Post()
  async create(
    @Body() createProductTypeDto: CreateProductTypeDto,
  ): Promise<ProductType> {
    return this.productTypeService.create(createProductTypeDto);
  }

  @Get()
  async findAll(): Promise<Array<ProductType>> {
    return this.productTypeService.findAll();
  }
}
