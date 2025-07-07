import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../entity/inventory.entity';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { ProductService } from '../../product/service/product.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly productService: ProductService,
  ) {}

  async updateInventory(
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<Inventory> {
    const { quantity, product } = updateInventoryDto;

    const productToUpdate = await this.productService.findProductById(product);

    const inventory = await this.inventoryRepository.findOneOrFail({
      where: { product: { id: productToUpdate.id } },
    });

    inventory.quantity = quantity;
    return this.inventoryRepository.save(inventory);
  }
}
