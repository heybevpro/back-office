import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItemIngredient } from '../entity/menu-item-ingredient.entity';
import { MenuItem } from '../entity/menu-item.entity';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { ProductService } from '../../product/service/product.service';
import { ServingSizeService } from '../../serving-size/service/serving-size.service';
import { VenueService } from '../../venue/service/venue.service';
import { DuplicateMenuItemNameException } from '../../../excpetions/menuItem.exception';
import { ObjectStoreService } from '../../object-store/service/object-store.service';
import { ServingSizeOrganizationMismatchException } from '../../../excpetions/menuItem.exception';
import { Product } from '../../product/entity/product.entity';
import { ServingSize } from '../../serving-size/entity/serving-size.entity';

const MenuItemRelations = {
  products: {
    product: {
      product_type: {
        serving_size: true,
      },
    },
    servingSize: true,
  },
};

@Injectable()
export class MenuItemService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(MenuItemIngredient)
    private readonly menuItemIngredientRepository: Repository<MenuItemIngredient>,
    private readonly productService: ProductService,
    private readonly servingSizeService: ServingSizeService,
    private readonly venueService: VenueService,
    private readonly objectStoreService: ObjectStoreService,
  ) {}

  async create(
    createMenuItemDto: CreateMenuItemDto,
    image?: { buffer: Buffer; mimetype: string; originalname: string },
  ): Promise<MenuItem> {
    const venue = await this.venueService.findOneById(
      createMenuItemDto.venue_id,
    );
    if (!venue) {
      throw new NotFoundException(
        `Venue ${createMenuItemDto.venue_id} not found`,
      );
    }

    const existing = await this.menuItemRepository.findOne({
      where: { name: createMenuItemDto.name, venue: { id: venue.id } },
    });
    if (existing)
      throw new DuplicateMenuItemNameException(createMenuItemDto.name);

    let imageUrl: string | undefined;
    if (image) {
      const baseUrl = `documents/organization/${venue.organization.id}/venue/${venue.id}/menuItem`;
      imageUrl = await this.objectStoreService.uploadDocument(image, baseUrl);
    }

    const menuItem = this.menuItemRepository.create({
      name: createMenuItemDto.name,
      description: createMenuItemDto.description,
      venue,
      price: Number(createMenuItemDto.price),
      image_url: imageUrl,
    });

    const productIds = createMenuItemDto.products.map((p) => p.product_id);
    const servingSizeIds = createMenuItemDto.products
      .map((p) => p.serving_size_id)
      .filter((id): id is string => !!id);

    const [products, servingSizes] = await Promise.all([
      this.productService.findAllWithIds(productIds),
      servingSizeIds.length > 0
        ? this.servingSizeService.findAllWithIds(servingSizeIds)
        : [],
    ]);

    const productMap = new Map<string, Product>(
      products.map((p: Product) => [p.id, p] as [string, Product]),
    );
    const servingSizeMap = new Map<string, ServingSize>(
      servingSizes.map((s: ServingSize) => [s.id, s] as [string, ServingSize]),
    );

    for (const size of servingSizes) {
      if (size.organization.id !== venue.organization.id) {
        throw new ServingSizeOrganizationMismatchException(size.id);
      }
    }

    menuItem.products = createMenuItemDto.products.map((itemProduct) => {
      const product = productMap.get(itemProduct.product_id);
      const servingSize = itemProduct.serving_size_id
        ? servingSizeMap.get(itemProduct.serving_size_id)
        : undefined;
      return this.menuItemIngredientRepository.create({
        product,
        servingSize,
        quantity: itemProduct.quantity,
      });
    });

    return this.menuItemRepository.save(menuItem);
  }

  async findAll(): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      relations: MenuItemRelations,
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOneById(id: string): Promise<MenuItem> {
    try {
      return await this.menuItemRepository.findOneOrFail({
        where: { id },
        relations: MenuItemRelations,
      });
    } catch (error) {
      throw new NotFoundException(`Menu item ${id} not found`, {
        cause: error,
      });
    }
  }

  async findByVenue(venueId: number): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      where: { venue: { id: venueId } },
      relations: MenuItemRelations,
      order: {
        created_at: 'DESC',
      },
    });
  }
}
