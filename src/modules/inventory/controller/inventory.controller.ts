import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from '../service/inventory.service';
import { Inventory } from '../entity/inventory.entity';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('venue/:venueId')
  async getInventoryByVenueId(
    @Param('venueId', ParseIntPipe) venueId: number,
  ): Promise<Inventory[]> {
    return await this.inventoryService.getInventoryByVenueId(venueId);
  }

  @Patch('update')
  async updateProductInventory(@Body() updateInventoryDto: UpdateInventoryDto) {
    return await this.inventoryService.updateInventoryForProduct(
      updateInventoryDto,
    );
  }
}
