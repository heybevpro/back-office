import { Body, Controller, Put } from '@nestjs/common';
import { InventoryService } from '../service/inventory.service';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { Inventory } from '../entity/inventory.entity';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Put('update')
  async updateInventory(
    @Body() updateInventoryDto: UpdateInventoryDto,
  ): Promise<Inventory> {
    return await this.inventoryService.updateInventory(updateInventoryDto);
  }
}
