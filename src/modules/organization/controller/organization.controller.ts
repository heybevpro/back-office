import {
  Body,
  Controller,
  Get,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from '../service/organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { DatabaseClientExceptionFilter } from '../../../filters/database-client-expection.filter';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(JwtAuthGuard)
  @UseFilters(DatabaseClientExceptionFilter)
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
