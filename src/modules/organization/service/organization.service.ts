import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Organization } from '../entity/organization.entity';
import { Repository } from 'typeorm';
import { CreateOrganizationDto } from '../dto/create-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    return await this.organizationRepository.save(
      this.organizationRepository.create(createOrganizationDto),
    );
  }

  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find();
  }
}
