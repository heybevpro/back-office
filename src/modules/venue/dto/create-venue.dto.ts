import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  name: string;

  @IsNumber({ maxDecimalPlaces: 0, allowInfinity: false })
  @IsPositive()
  organization: number;
}
