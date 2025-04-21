import {
  IsDecimal,
  IsNotEmpty,
  IsOptional,
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
}
