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
} from 'class-validator';

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
  @Type(() => MenuItemProductDto)
  products: MenuItemProductDto[];
}

export class MenuItemProductDto {
  @IsUUID()
  product_id: string;

  @IsOptional()
  @IsUUID()
  custom_serving_size_id?: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
