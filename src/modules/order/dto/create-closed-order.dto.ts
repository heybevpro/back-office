import { IsArray } from 'class-validator';
import { MenuItem } from '../../menu-item/entity/menu-item.entity';

export class CreateClosedOrderDto {
  @IsArray()
  details: Array<MenuItem>;
}
