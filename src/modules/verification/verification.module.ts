import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './entity/verification-code.entity';
import { VerificationService } from './service/verification.service';
import { VerificationController } from './controller/verification.controller';
import { InvitationModule } from '../invitation/invitation.module';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationCode]), InvitationModule],
  providers: [VerificationService],
  controllers: [VerificationController],
})
export class VerificationModule {}
