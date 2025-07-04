import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServingSize } from '../entity/serving-size.entity';
import { CreateServingSizeDto } from '../dto/create-serving-size.dto';
import { OrganizationService } from '../../organization/service/organization.service';
import {
  ServingSizeConflictException,
  ServingSizeOrganizationNotFoundException,
} from '../../../excpetions/servingSize.exception';

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
      throw new ServingSizeOrganizationNotFoundException(dto.organization);
    }

    const existing = await this.servingSizeRepository.findOne({
      where: {
        label: dto.label,
        organization: { id: organization.id },
      },
    });
    if (existing) {
      throw new ServingSizeConflictException(dto.label);
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
      relations: { organization: true },
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
