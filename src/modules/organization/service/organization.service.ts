import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
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
    try {
      return await this.organizationRepository.save(
        this.organizationRepository.create(createOrganizationDto),
      );
    } catch (error) {
      throw new BadRequestException('Failed create organization.', {
        cause: error,
      });
    }
  }

  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find();
  }

  async findOne(name: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({
      where: { name },
    });
  }
}
