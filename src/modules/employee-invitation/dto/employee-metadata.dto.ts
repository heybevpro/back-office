import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class CreateEmployeeMetadataDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  address_line1: string;

  @IsOptional()
  @IsString()
  address_line2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  state: string;

  @IsString()
  @IsNotEmpty()
  zip: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('US')
  phone: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'Invalid PIN Format',
  })
  pin: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  venue: number;
}
