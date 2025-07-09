import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class UpdateInventoryDto {
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  @IsNotEmpty()
  quantity: number;

  @IsUUID()
  @IsNotEmpty()
  product: string;
}
