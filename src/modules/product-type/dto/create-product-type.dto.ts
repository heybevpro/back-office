import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  name: string;

  @IsNumber()
  @IsPositive()
  venue: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  serving_sizes: string[];
}
