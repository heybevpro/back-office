import {
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateVenueDto {
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  state: string;

  @IsPhoneNumber()
  phone_number: string;

  @IsNumber()
  @IsPositive()
  capacity: number;

  @IsNumber({ maxDecimalPlaces: 0, allowInfinity: false })
  @IsPositive()
  organization: number;
}
