import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entity/device.entity';
import { CreateDeviceDto } from '../dto/device.dto';
import { Venue } from '../../venue/entity/venue.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
  ) {}

  async create(dto: CreateDeviceDto): Promise<Device> {
    try {
      const venue = await this.venueRepository.findOne({
        where: { id: dto.venue },
        relations: ['device'],
      });

      if (!venue) {
        throw new NotFoundException(`Venue with ID ${dto.venue} not found`);
      }

      if (venue.device) {
        throw new NotFoundException(
          `Venue with ID ${dto.venue} already has a device linked (Device ID: ${venue.device.id})`,
        );
      }

      const existingDevice = await this.deviceRepository.findOne({
        where: { id: dto.id },
      });

      if (existingDevice) {
        throw new BadRequestException(
          `Device with ID ${dto.id} already exists`,
        );
      }

      const device = this.deviceRepository.create({
        id: dto.id,
        name: dto.name,
        venue,
      });

      return await this.deviceRepository.save(device);
    } catch (err) {
      throw new BadRequestException('Unable to create device', {
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
}
