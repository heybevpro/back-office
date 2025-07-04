import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
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

  @IsUUID()
  @IsNotEmpty()
  serving_size: string;
}
