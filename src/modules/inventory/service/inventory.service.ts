import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../entity/inventory.entity';

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
}
