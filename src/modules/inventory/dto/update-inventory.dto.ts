import { IsDecimal, IsNotEmpty, IsPositive, IsUUID } from 'class-validator';

export class UpdateInventoryDto {
  @IsDecimal({ decimal_digits: '0,3' })
  @IsPositive()
  @IsNotEmpty()
  quantity: number;

  @IsUUID()
  @IsNotEmpty()
  product: string;
}
