import { Module } from '@nestjs/common';
import { Organization } from './entity/organization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './service/organization.service';
import { OrganizationController } from './controller/organization.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  providers: [OrganizationService],
  controllers: [OrganizationController],
})
export class OrganizationModule {}
