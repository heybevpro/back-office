import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';

export class CreateEmployeeDto {
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

  @IsPositive()
  venue: number;

  @IsUrl()
  @IsNotEmpty()
  document: string;
}
