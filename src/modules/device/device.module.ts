import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entity/device.entity';
import { DeviceController } from './controller/device.controller';
import { DeviceService } from './service/device.service';
import { Venue } from '../venue/entity/venue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Venue])],
  providers: [DeviceService],
  exports: [DeviceService],
  controllers: [DeviceController],
})
export class DeviceModule {}
