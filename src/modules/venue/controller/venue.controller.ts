import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
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
  @Get()
  async findByOrganization(
    @Request()
    request: {
      user: { organization: { id: number } };
    },
  ) {
    return await this.venueService.findAllByOrganization(
      request.user.organization.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.venueService.findOneById(id);
  }
}
