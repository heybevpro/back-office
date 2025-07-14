import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MenuItemService } from '../service/menu-item.service';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuItem } from '../entity/menu-item.entity';
import { CreateMenuItemFormDataToJsonPipe } from '../pipes/create-menu-item-form-data-to-json-pipe.service';
import { AuthorizedRequest } from '../../../utils/constants/auth.constants';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';

@UseGuards(JwtAuthGuard)
@Controller('menu-item')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createMenuItem(
    @Request() request: AuthorizedRequest,
    @Body(CreateMenuItemFormDataToJsonPipe) dto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5000000 })],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ): Promise<MenuItem> {
    return await this.menuItemService.createMenuItemFromIngredients(
      dto as CreateMenuItemDto,
      request.user.organization.id,
      image,
    );
  }

  @Get('/venue/:venueId')
  async getMenuItemsByVenue(@Param('venueId', ParseIntPipe) venueId: number) {
    return await this.menuItemService.getMenuItemsByVenue(venueId);
  }
}
