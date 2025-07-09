import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from '../service/inventory.service';
import { Inventory } from '../entity/inventory.entity';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';

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
}
