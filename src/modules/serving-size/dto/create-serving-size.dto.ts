import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateServingSizeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  label: string;

  @IsNumber()
  @IsPositive()
  volume_in_ml: number;

  @IsNumber()
  @IsPositive()
  organization: number;
}
