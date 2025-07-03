import { Type } from 'class-transformer';
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
  custom_serving_size_id?: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
