import { VerificationService } from '../service/verification.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateVerificationCodeDto } from '../dto/create-verification-code.dto';
import { VerifyPhoneDto } from '../dto/verify-phone.dto';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { VerifyEmailDto } from '../dto/verify-email.dto';

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

  @UseGuards(JwtAuthGuard)
  @Post('email')
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Request() request: { user: { email: string } },
  ) {
    return this.verificationService.verifyEmail(
      verifyEmailDto,
      request.user.email,
    );
  }
}
