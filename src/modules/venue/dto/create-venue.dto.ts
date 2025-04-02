import {
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @MaxLength(100)
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

  @IsNumber(
    { maxDecimalPlaces: 0, allowInfinity: false },
    { message: 'Capacity cannot be a decimal.' },
  )
  @Max(1000000)
  @IsPositive()
  capacity: number;

  @IsNumber({ maxDecimalPlaces: 0, allowInfinity: false })
  @IsPositive()
  organization: number;
}
