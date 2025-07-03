import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entity/device.entity';
import { CreateDeviceDto } from '../dto/device.dto';
import { VenueService } from '../../venue/service/venue.service';
import {
  DeviceConflictException,
  VenueNotFoundException,
} from '../../../excpetions/device.exception';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,

    private readonly venueService: VenueService,
  ) {}

  async create(dto: CreateDeviceDto): Promise<Device> {
    const existingDevice = await this.deviceRepository.findOne({
      where: { id: dto.id },
    });

    if (existingDevice) {
      throw new DeviceConflictException(dto.id);
    }

    const venue = await this.venueService.findOneById(dto.venue);

    if (!venue) {
      throw new VenueNotFoundException(dto.venue);
    }

    try {
      return await this.deviceRepository.save(
        this.deviceRepository.create({ ...dto, venue: { id: dto.venue } }),
      );
    } catch (err: unknown) {
      throw new BadRequestException(err, {
        cause: err,
      });
    }
  }

  async findById(id: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { id },
      relations: { venue: true },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }

  async findAllByVenueId(venueId: number): Promise<Device[]> {
    return this.deviceRepository.find({
      where: { venue: { id: venueId } },
    });
  }
}
