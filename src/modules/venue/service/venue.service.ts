import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Venue } from '../entity/venue.entity';
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
      this.venueRepository.create({
        name: createVenueDto.name,
        address: createVenueDto.address,
        city: createVenueDto.city,
        state: createVenueDto.state,
        capacity: createVenueDto.capacity,
        phone_number: createVenueDto.phone_number,
        organization: { id: createVenueDto.organization },
      }),
    );
  }

  async findAllByOrganization(organizationId: number) {
    return await this.venueRepository.find({
      relations: { organization: true },
      select: { organization: { id: false } },
      where: {
        organization: { id: organizationId },
      },
    });
  }
}
