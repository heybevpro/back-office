import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MenuItemIngredientDto } from './menu-item-ingredient.dto';

export class CreateMenuItemDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(90)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @IsPositive()
  venue: number;

  @ValidateNested({ each: true })
  @Type(() => MenuItemIngredientDto)
  ingredients: Array<MenuItemIngredientDto>;
}
