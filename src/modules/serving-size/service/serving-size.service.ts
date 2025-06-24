import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServingSize } from '../entity/serving-size.entity';
import { CreateServingSizeDto } from '../dto/create-serving-size.dto';
import { OrganizationService } from '../../organization/service/organization.service';

@Injectable()
export class ServingSizeService {
  constructor(
    @InjectRepository(ServingSize)
    private readonly servingSizeRepository: Repository<ServingSize>,

    private readonly organizationService: OrganizationService,
  ) {}

  async create(dto: CreateServingSizeDto): Promise<ServingSize> {
    const organization = await this.organizationService.findOneById(
      dto.organization,
    );

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const servingSize = this.servingSizeRepository.create({
      label: dto.label,
      volume_in_ml: dto.volume_in_ml,
      organization,
    });

    return await this.servingSizeRepository.save(servingSize);
  }

  async findAllByOrganization(organizationId: number): Promise<ServingSize[]> {
    return await this.servingSizeRepository.find({
      relations: ['organization'],
      where: {
        organization: { id: organizationId },
      },
      order: { created_at: 'DESC' },
    });
  }

  async findOneById(id: string): Promise<ServingSize> {
    return await this.servingSizeRepository.findOneOrFail({
      where: { id },
      relations: ['organization'],
    });
  }
}
