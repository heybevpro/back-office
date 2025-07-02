import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MenuItemService } from '../service/menu-item.service';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { MenuItem } from '../entity/menu-item.entity';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';

@Controller('menu-item')
@UseGuards(JwtAuthGuard)
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  async create(
    @Body() createMenuItemDto: CreateMenuItemDto,
  ): Promise<MenuItem> {
    return this.menuItemService.create(createMenuItemDto);
  }

  @Get()
  async findAll(): Promise<MenuItem[]> {
    return this.menuItemService.findAll();
  }

  @Get('venue/:venueId')
  async findByVenue(@Param('venueId') venueId: number): Promise<MenuItem[]> {
    return this.menuItemService.findByVenue(venueId);
  }
}
