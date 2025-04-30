import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './entity/venue.entity';
import { VenueService } from './service/venue.service';
import { VenueController } from './controller/venue.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Venue])],
  providers: [VenueService],
  controllers: [VenueController],
  exports: [VenueService],
})
export class VenueModule {}
