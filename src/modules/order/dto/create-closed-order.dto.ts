import { IsArray, IsOptional, IsString } from 'class-validator';
import { Product } from '../../product/entity/product.entity';

export class CreateClosedOrderDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  details: Array<Product>;
}
