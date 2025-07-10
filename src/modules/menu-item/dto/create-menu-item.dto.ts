import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  IsUUID,
  Matches,
  IsDecimal,
} from 'class-validator';

export class CreateMenuItemRawDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'venue_id must contain only digits' })
  venue_id: string;

  @Transform(({ value }) => Number(value).toFixed(2))
  @IsDecimal({ decimal_digits: '2', force_decimal: true })
  price: string;

  @IsString()
  @IsNotEmpty()
  products: string;
}

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  venue_id: number;

  @Transform(({ value }) => Number(value).toFixed(2))
  @IsDecimal({ decimal_digits: '2', force_decimal: true })
  price: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemIngredientDto)
  products: MenuItemIngredientDto[];
}

export class MenuItemIngredientDto {
  @IsUUID()
  product_id: string;

  @IsOptional()
  @IsUUID()
  serving_size_id?: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
