import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Venue } from '../enitity/venue.entity';
import { Repository } from 'typeorm';
import { CreateVenueDto } from '../dto/create-venue.dto';

@Injectable()
export class VenueService {
  constructor(
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
  ) {}

  async create(createVenueDto: CreateVenueDto) {
    return await this.venueRepository.save(
      this.venueRepository.create(createVenueDto),
    );
  }

  async findAllByOrganization(organizationId: number) {
    return await this.venueRepository.find({
      relations: { organization: true },
      where: {
        organization: { id: organizationId },
      },
    });
  }
}
