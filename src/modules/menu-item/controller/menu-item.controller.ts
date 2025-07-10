import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { MenuItemService } from '../service/menu-item.service';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';

@Controller('menu-item')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  async createMenuItem(@Body() dto: CreateMenuItemDto) {
    return await this.menuItemService.createMenuItemFromIngredients(dto);
  }

  @Get('/venue/:venueId')
  async getMenuItemsByVenue(@Param('venueId', ParseIntPipe) venueId: number) {
    return await this.menuItemService.getMenuItemsByVenue(venueId);
  }
}
