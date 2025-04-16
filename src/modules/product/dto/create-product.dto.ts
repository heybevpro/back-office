import {
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @IsDecimal()
  price: number;

  @IsOptional()
  description?: string;

  @IsUUID()
  product_type: string;
}
