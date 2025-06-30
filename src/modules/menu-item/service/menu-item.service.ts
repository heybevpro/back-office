import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem, MenuItemIngredient } from '../entity/menu-item.entity';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { ProductService } from '../../product/service/product.service';
import { ServingSizeService } from '../../serving-size/service/serving-size.service';
import { ServingSize } from '../../serving-size/entity/serving-size.entity';
import { VenueService } from '../../venue/service/venue.service';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    private readonly productService: ProductService,
    private readonly servingSizeService: ServingSizeService,
    private readonly venueService: VenueService,
  ) {}

  async create(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const venue = await this.venueService.findOneById(
      createMenuItemDto.venue_id,
    );
    if (!venue) {
      throw new NotFoundException(
        `Venue ${createMenuItemDto.venue_id} not found`,
      );
    }

    const menuItem = this.menuItemRepository.create({
      name: createMenuItemDto.name,
      description: createMenuItemDto.description,
      venue,
    });

    const productIds = createMenuItemDto.products.map((p) => p.product_id);
    const servingSizeIds = createMenuItemDto.products
      .map((p) => p.custom_serving_size_id)
      .filter((id): id is string => id !== undefined);

    const [products, servingSizes] = await Promise.all([
      this.productService.findAllWithIds(productIds),
      servingSizeIds.length > 0
        ? Promise.all(
            servingSizeIds.map((id) => this.servingSizeService.findOneById(id)),
          )
        : Promise.resolve([] as ServingSize[]),
    ]);

    const validServingSizes = servingSizes.filter((s): s is ServingSize => !!s);

    for (const servingSize of validServingSizes) {
      if (servingSize.organization.id !== venue.organization.id) {
        throw new NotFoundException(
          `Serving size ${servingSize.id} does not belong to the venue's organization`,
        );
      }
    }

    menuItem.products = createMenuItemDto.products.map((itemProduct) => {
      const product = products.find((p) => p.id === itemProduct.product_id);
      if (!product) {
        throw new NotFoundException(
          `Product ${itemProduct.product_id} not found`,
        );
      }

      let customServingSize: ServingSize | undefined;
      if (itemProduct.custom_serving_size_id) {
        customServingSize = validServingSizes.find(
          (s) => s.id === itemProduct.custom_serving_size_id,
        );
        if (!customServingSize) {
          throw new NotFoundException(
            `Serving size ${itemProduct.custom_serving_size_id} not found`,
          );
        }
      }

      return this.menuItemRepository.manager.create(MenuItemIngredient, {
        product,
        custom_serving_size: customServingSize,
        quantity: itemProduct.quantity,
      });
    });

    return this.menuItemRepository.save(menuItem);
  }

  async findAll(): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      relations: [
        'products',
        'products.product',
        'products.product.product_type',
        'products.product.product_type.serving_size',
        'products.customServingSize',
      ],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOneById(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: [
        'products',
        'products.product',
        'products.product.product_type',
        'products.product.product_type.serving_size',
        'products.customServingSize',
      ],
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item ${id} not found`);
    }

    return menuItem;
  }

  async getMenuItemRecipe(menuItemId: string): Promise<MenuItem> {
    return this.findOneById(menuItemId);
  }
}
