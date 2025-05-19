import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  address_line1: string;

  @IsOptional()
  @IsString()
  address_line2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zip: string;

  @IsEmail()
  email: string;

  @Matches(/^\+?[0-9\-\s]{7,15}$/)
  phone: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/)
  pin: string;

  @IsArray()
  venues: number[];
}
