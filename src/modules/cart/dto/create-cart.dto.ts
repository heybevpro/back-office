import { IsInt, IsUUID } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productId: string;

  @IsInt()
  quantity: number;
}

export class RemoveFromCartDto {
  @IsUUID()
  productId: string;
}
