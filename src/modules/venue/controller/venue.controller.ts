import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { VenueService } from '../service/venue.service';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { CreateVenueDto } from '../dto/create-venue.dto';

@Controller('venue')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createVenueDto: CreateVenueDto) {
    return await this.venueService.create(createVenueDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-organization/:organization')
  async findByOrganization(@Param('organization') organization: number) {
    return await this.venueService.findAllByOrganization(organization);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOneById(@Param('id') id: number) {
    return await this.venueService.findOneById(id);
  }
}
