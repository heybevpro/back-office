import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './enitity/venue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venue])],
  providers: [],
  controllers: [],
})
export class VenueModule {}
