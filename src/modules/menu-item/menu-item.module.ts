import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entity/menu-item.entity';
import { MenuItemIngredient } from './entity/menu-item-ingredient.entity';
import { MenuItemService } from './service/menu-item.service';
import { MenuItemController } from './controller/menu-item.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem, MenuItemIngredient])],
  controllers: [MenuItemController],
  providers: [MenuItemService],
})
export class MenuItemModule {}
