import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MenuItem } from '../entity/menu-item.entity';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { MenuItemIngredient } from '../entity/menu-item-ingredient.entity';
import { MenuItemIngredientDto } from '../dto/menu-item-ingredient.dto';
import {
  FailedToCreateMenuItem,
  FailedToCreateMenuItemIngredients,
} from '../../../exceptions/menu-item.exception';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(MenuItemIngredient)
    private readonly menuItemIngredientRepository: Repository<MenuItemIngredient>,
    private dataSource: DataSource,
  ) {}

  async createMenuItemFromIngredients(
    createMenuItemDto: CreateMenuItemDto,
  ): Promise<MenuItem> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedMenuItem = await this.createMenuItemEntity(createMenuItemDto);
      await this.createMenuItemIngredients(
        createMenuItemDto.ingredients,
        savedMenuItem.id,
      );
      await queryRunner.commitTransaction();

      return savedMenuItem;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createMenuItemEntity(
    createMenuItemDto: CreateMenuItemDto,
  ): Promise<MenuItem> {
    try {
      return await this.menuItemRepository.save(
        this.menuItemRepository.create({
          name: createMenuItemDto.name,
          description: createMenuItemDto.description,
          price: createMenuItemDto.price,
          venue: { id: createMenuItemDto.venue },
        }),
      );
    } catch (error: unknown) {
      throw new FailedToCreateMenuItem(error);
    }
  }

  async createMenuItemIngredients(
    menuItemIngredients: Array<MenuItemIngredientDto>,
    menuItemId: string,
  ): Promise<Array<MenuItemIngredient>> {
    try {
      const ingredients = menuItemIngredients.map((ingredientDto) =>
        this.menuItemIngredientRepository.create({
          product: { id: ingredientDto.product },
          quantity: ingredientDto.quantity,
          serving_size: { id: ingredientDto.servingSize },
          menu_item: { id: menuItemId },
        }),
      );

      return await this.menuItemIngredientRepository.save(ingredients);
    } catch (error: unknown) {
      throw new FailedToCreateMenuItemIngredients(error);
    }
  }

  getMenuItemsByVenue = async (venueId: number): Promise<Array<MenuItem>> => {
    return this.menuItemRepository.find({
      where: { venue: { id: venueId } },
      order: { name: 'ASC' },
    });
  };
}
