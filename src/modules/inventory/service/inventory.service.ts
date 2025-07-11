import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../entity/inventory.entity';
import { ProductNotFoundException } from '../../../exceptions/product.exception';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  getNewInventoryEntity(): Inventory {
    return this.inventoryRepository.create();
  }

  async getInventoryByVenueId(venueId: number): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: { product: { venue: { id: venueId } } },
      relations: { product: { venue: true } },
      order: { updated_at: 'DESC' },
    });
  }

  async updateInventoryForProduct(
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { product: { id: updateInventoryDto.product } },
      relations: { product: true },
    });

    if (!inventory) {
      throw new ProductNotFoundException();
    }

    inventory.quantity = updateInventoryDto.quantity;
    return await this.inventoryRepository.save(inventory);
  }

  async updateInventoryForProductMap(
    productMap: Record<string, { total: number; used: number }>,
  ) {
    const inventoryUpdates = Object.entries(productMap).map(
      async ([productId, { total, used }]) => {
        const inventory = await this.inventoryRepository.findOne({
          where: { product: { id: productId } },
          relations: { product: true },
        });

        if (!inventory) {
          throw new ProductNotFoundException();
        }

        inventory.quantity = total - used;
        return await this.inventoryRepository.save(inventory);
      },
    );

    return Promise.all(inventoryUpdates);
  }
}
