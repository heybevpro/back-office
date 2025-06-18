import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ProductServingSize } from '../../../utils/constants/product.constants';

export class CreateProductTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  name: string;

  @IsNumber()
  @IsPositive()
  venue: number;

  @IsEnum(ProductServingSize)
  serving_size: ProductServingSize;
}
