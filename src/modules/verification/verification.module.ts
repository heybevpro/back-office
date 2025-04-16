import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './entity/verification-code.entity';
import { VerificationService } from './service/verification.service';
import { VerificationController } from './controller/verification.controller';
import { InvitationModule } from '../invitation/invitation.module';
import { EmailVerificationCode } from './entity/email-verification-code.entity';
import { EmailService } from '../email/service/email.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationCode, EmailVerificationCode]),
    InvitationModule,
    UserModule,
  ],
  providers: [VerificationService, EmailService],
  controllers: [VerificationController],
  exports: [VerificationService],
})
export class VerificationModule {}
