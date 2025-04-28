import { IsArray } from 'class-validator';
import { Product } from '../../product/entity/product.entity';

export class CreateClosedOrderDto {
  @IsArray()
  details: Array<Product>;
}
