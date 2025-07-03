import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MenuItemService } from '../service/menu-item.service';
import {
  CreateMenuItemDto,
  MenuItemIngredientDto,
  CreateMenuItemRawDto,
} from '../dto/create-menu-item.dto';
import { MenuItem } from '../entity/menu-item.entity';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Controller('menu-item')
@UseGuards(JwtAuthGuard)
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() rawDto: CreateMenuItemRawDto,
    @UploadedFile()
    image?: { buffer: Buffer; mimetype: string; originalname: string },
  ): Promise<MenuItem> {
    const parsedDto: CreateMenuItemDto = {
      ...rawDto,
      venue_id: parseInt(rawDto.venue_id, 10),
      products: JSON.parse(rawDto.products) as MenuItemIngredientDto[],
    };
    const menuItemDto = plainToInstance(CreateMenuItemDto, parsedDto);
    await validateOrReject(menuItemDto);
    return this.menuItemService.create(menuItemDto, image);
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
