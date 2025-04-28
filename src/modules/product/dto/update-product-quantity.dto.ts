import { IsNumber, IsUUID, Min } from 'class-validator';

export class UpdateProductQuantityDto {
  @IsUUID()
  product: string;

  @IsNumber({ allowInfinity: false })
  @Min(0)
  quantity: number;
}
