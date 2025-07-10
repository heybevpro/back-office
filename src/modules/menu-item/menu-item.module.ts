import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entity/menu-item.entity';
import { MenuItemService } from './service/menu-item.service';
import { MenuItemController } from './controller/menu-item.controller';
import { ProductModule } from '../product/product.module';
import { ServingSizeModule } from '../serving-size/serving-size.module';
import { VenueModule } from '../venue/venue.module';
import { ObjectStoreModule } from '../object-store/object-store.module';
import { MenuItemIngredient } from './entity/menu-item-ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuItem, MenuItemIngredient]),
    VenueModule,
    ProductModule,
    ServingSizeModule,
    ObjectStoreModule,
  ],
  providers: [MenuItemService],
  controllers: [MenuItemController],
  exports: [MenuItemService],
})
export class MenuItemModule {}
