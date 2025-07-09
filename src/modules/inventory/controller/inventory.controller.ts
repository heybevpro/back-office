import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { InventoryService } from '../service/inventory.service';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { Inventory } from '../entity/inventory.entity';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('venue/:venueId')
  async getInventoryByVenueId(
    @Param('venueId') venueId: number,
  ): Promise<Inventory[]> {
    return await this.inventoryService.getInventoryByVenueId(venueId);
  }

  @Put('update')
  async updateInventory(
    @Body() updateInventoryDto: UpdateInventoryDto,
  ): Promise<Inventory> {
    return await this.inventoryService.updateInventory(updateInventoryDto);
  }
}
