import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './enitity/venue.entity';
import { VenueService } from './service/venue.service';
import { VenueController } from './controller/venue.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Venue])],
  providers: [VenueService],
  controllers: [VenueController],
})
export class VenueModule {}
