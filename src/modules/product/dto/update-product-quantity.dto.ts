import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class UpdateProductQuantityDto {
  @IsUUID()
  product: string;

  @IsNumber({ allowInfinity: false })
  @Min(0)
  @Max(2147483647)
  quantity: number;
}
