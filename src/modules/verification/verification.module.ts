import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './entity/verification-code.entity';
import { VerificationService } from './service/verification.service';
import { VerificationController } from './controller/verification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationCode])],
  providers: [VerificationService],
  controllers: [VerificationController],
})
export class VerificationModule {}
