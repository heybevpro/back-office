import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Device } from '../entity/device.entity';
import { CreateDeviceDto } from '../dto/device.dto';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { DeviceService } from '../service/device.service';

@UseGuards(JwtAuthGuard)
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('/register')
  async create(@Body() dto: CreateDeviceDto): Promise<Device> {
    return await this.deviceService.create(dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Device> {
    return await this.deviceService.findById(id);
  }

  @Get('venue/:venueId')
  async findAllByVenueId(@Param('venueId') venueId: number): Promise<Device[]> {
    return await this.deviceService.findAllByVenueId(venueId);
  }
}
