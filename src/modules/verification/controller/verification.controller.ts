import { VerificationService } from '../service/verification.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateVerificationCodeDto } from '../dto/create-verification-code.dto';
import { VerifyPhoneDto } from '../dto/verify-phone.dto';
import { CreateEmailVerificationCodeDto } from '../dto/create-email-verification-code.dto';

@Controller('verify')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post('request')
  async request(@Body() createVerificationCodeDto: CreateVerificationCodeDto) {
    return await this.verificationService.addPhoneVerificationRecord(
      createVerificationCodeDto,
    );
  }

  @Get()
  async getValidRecords(@Query('phone') phone: string) {
    return await this.verificationService.getVerificationCodes(phone);
  }

  @Post()
  async verify(@Body() verifyPhoneDto: VerifyPhoneDto) {
    return await this.verificationService.verifyPhoneNumber(verifyPhoneDto);
  }

  @Post('email')
  async verifyEmail(
    @Body() createEmailVerificationDto: CreateEmailVerificationCodeDto,
  ) {
    return this.verificationService.addEmailVerificationRecord(
      createEmailVerificationDto,
    );
  }
}
