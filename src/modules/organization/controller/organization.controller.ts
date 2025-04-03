import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OrganizationService } from '../service/organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return await this.organizationService.create(createOrganizationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return await this.organizationService.findAll();
  }
}
