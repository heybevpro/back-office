import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './entity/verification-code.entity';
import { VerificationService } from './service/verification.service';
import { VerificationController } from './controller/verification.controller';
import { InvitationModule } from '../invitation/invitation.module';
import { EmailVerificationCode } from './entity/email-verification-code.entity';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationCode, EmailVerificationCode]),
    InvitationModule,
    UserModule,
    EmailModule,
  ],
  providers: [VerificationService],
  controllers: [VerificationController],
  exports: [VerificationService],
})
export class VerificationModule {}
