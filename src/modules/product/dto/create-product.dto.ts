import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDecimal()
  price: number;

  @IsOptional()
  description?: string;

  @IsUUID()
  product_type: string;

  @IsNumber()
  @IsPositive()
  venue: number;
}
