import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Device } from '../entity/device.entity';
import { CreateDeviceDto } from '../dto/device.dto';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { DeviceService } from '../service/device.service';
import { DeviceResponse } from '../../../config/device.configuration';

@UseGuards(JwtAuthGuard)
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('/register')
  async create(@Body() dto: CreateDeviceDto): Promise<Device> {
    return await this.deviceService.create(dto);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Request() request: { user: { id: string } },
  ): Promise<DeviceResponse> {
    return await this.deviceService.findById(id, request.user);
  }
}
