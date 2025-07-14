import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { CreateMenuItemMultipartFormData } from '../../../types/menu-item.types';
import { MenuItemIngredientDto } from '../dto/menu-item-ingredient.dto';

@Injectable()
export class CreateMenuItemFormDataToJsonPipe implements PipeTransform {
  async transform(value: CreateMenuItemMultipartFormData) {
    const parsedBody: CreateMenuItemDto = {
      name: value.name,
      description: value.description,
      ingredients: JSON.parse(
        value.ingredients,
      ) as Array<MenuItemIngredientDto>,
      price: Number(value.price),
      venue: Number(value.venue),
      productType: value.productType,
    };
    const dtoObject = plainToInstance(CreateMenuItemDto, parsedBody);
    const errors = await validate(dtoObject);

    if (errors.length > 0) {
      const validationErrors = errors.map((err) =>
        Object.values(err.constraints || {}).join(', '),
      );
      throw new BadRequestException(validationErrors);
    }

    return dtoObject;
  }
}
