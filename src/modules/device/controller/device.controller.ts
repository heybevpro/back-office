import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Device } from '../entity/device.entity';
import { DeviceService } from '../service/device.service';
import { CreateDeviceDto } from '../dto/device.dto';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  async create(@Body() dto: CreateDeviceDto): Promise<Device> {
    return this.deviceService.create(dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Device> {
    return this.deviceService.findById(id);
  }
}
