import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entity/device.entity';
import { CreateDeviceDto } from '../dto/device.dto';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async create(dto: CreateDeviceDto): Promise<Device> {
    try {
      return await this.deviceRepository.save(
        this.deviceRepository.create({ ...dto, venue: { id: dto.venue } }),
      );
    } catch (err: unknown) {
      throw new BadRequestException(err, { cause: err });
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
