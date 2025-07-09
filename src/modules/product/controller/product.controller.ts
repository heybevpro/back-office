import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from '../service/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entity/product.entity';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { UpdateProductQuantityDto } from '../dto/update-product-quantity.dto';

@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return await this.productService.create(createProductDto);
  }

  @Get('venue/:venueId')
  async findAll(@Param('venueId') venueId: number): Promise<Product[]> {
    return await this.productService.findAllForVenue(venueId);
  }

  @Get('by-product-type/:productTypeId')
  async findByProductType(
    @Param('productTypeId') productTypeId: string,
  ): Promise<Array<Product>> {
    return this.productService.findAllByProductType(productTypeId);
  }

  @Get('inventory')
  async fetchInventory(): Promise<Array<Product>> {
    return this.productService.fetchInventory();
  }

  @Put('inventory')
  async updateItemQuantity(
    @Body() updateProductQuantityDto: UpdateProductQuantityDto,
  ) {
    return await this.productService.updateItemQuantity(
      updateProductQuantityDto,
    );
  }
}
