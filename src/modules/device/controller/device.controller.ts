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
import { Device } from '../entity/device.entity';
import { CreateDeviceDto } from '../dto/device.dto';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { DeviceService } from '../service/device.service';
import { DeviceResponse } from '../../../config/device.configuration';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get('venue/:venueId')
  async findVenue(
    @Param('venueId', new ParseIntPipe()) venueId: number,
  ): Promise<Array<Device>> {
    return await this.deviceService.findAllDevicesByVenue(venueId);
  }
}
