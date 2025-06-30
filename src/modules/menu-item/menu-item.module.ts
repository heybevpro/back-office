import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entity/menu-item.entity';
import { MenuItemService } from './service/menu-item.service';
import { MenuItemController } from './controller/menu-item.controller';
import { ProductModule } from '../product/product.module';
import { ServingSizeModule } from '../serving-size/serving-size.module';
import { VenueModule } from '../venue/venue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuItem]),
    VenueModule,
    ProductModule,
    ServingSizeModule,
  ],
  providers: [MenuItemService],
  controllers: [MenuItemController],
  exports: [MenuItemService],
})
export class MenuItemModule {}
