import { IsNumber, IsPositive } from 'class-validator';

export class FindVenuesByOrganizationDto {
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  organization: number;
}
