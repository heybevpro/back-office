import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServingSize } from './entity/serving-size.entity';
import { ServingSizeService } from './service/serving-size.service';
import { ServingSizeController } from './controller/serving-size.controller';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [TypeOrmModule.forFeature([ServingSize]), OrganizationModule],
  providers: [ServingSizeService],
  controllers: [ServingSizeController],
  exports: [ServingSizeService],
})
export class ServingSizeModule {}
