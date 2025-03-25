import { VerificationService } from '../service/verification.service';
import { Body, Controller, Post } from '@nestjs/common';
import { CreateVerificationCodeDto } from '../dto/create-verification-code.dto';

@Controller()
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post('request')
  async request(@Body() createVerificationCodeDto: CreateVerificationCodeDto) {
    return await this.verificationService.addPhoneVerificationRecord(
      createVerificationCodeDto,
    );
  }
}
