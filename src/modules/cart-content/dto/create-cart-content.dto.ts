import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCartContentDto {
  @IsInt()
  @IsNotEmpty()
  cartId: number;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
