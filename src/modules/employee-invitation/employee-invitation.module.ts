import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeInvitationService } from './service/employee-invitation.service';
import { EmployeeInvitation } from './entity/employee-invitation.entity';
import { EmployeeInvitationController } from './controller/employee-invitation.controller';
import { EmailModule } from '../email/email.module';
import { VenueModule } from '../venue/venue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeInvitation]),
    EmailModule,
    VenueModule,
  ],
  providers: [EmployeeInvitationService],
  exports: [EmployeeInvitationService],
  controllers: [EmployeeInvitationController],
})
export class EmployeeInvitationModule {}
