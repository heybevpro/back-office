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
      const existingDevice = await this.deviceRepository.findOne({
        where: { id: dto.id },
      });

      if (existingDevice) {
        throw new BadRequestException(
          `Device with serial number ${dto.id} is already registered.`,
        );
      }

      const venue = await this.venueRepository.findOne({
        where: { id: dto.venue },
      });

      if (!venue) {
        throw new NotFoundException(`Venue with ID ${dto.venue} not found.`);
      }

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
}
