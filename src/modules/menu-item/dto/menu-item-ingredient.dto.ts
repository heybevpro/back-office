import { IsNumber, IsUUID } from 'class-validator';

export class MenuItemIngredientDto {
  @IsUUID()
  product: string;

  @IsNumber()
  quantity: number;

  @IsUUID()
  servingSize: string;
}
