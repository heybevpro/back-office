import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ProductService } from '../service/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entity/product.entity';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';

@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }
}
