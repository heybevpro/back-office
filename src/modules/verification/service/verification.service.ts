import { Injectable, NotFoundException } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { VerificationCode } from '../entity/verification-code.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt as randomVerificationCodeGenerator } from 'node:crypto';
import { CreateVerificationCodeDto } from '../dto/create-verification-code.dto';
import {
  EmailVerificationSuccessfulResponse,
  VerificationMessageSentSuccessResponse,
  VerificationSuccessfulResponse,
} from '../../../utils/constants/api-response.constants';
import { VerifyPhoneDto } from '../dto/verify-phone.dto';
import { InvitationService } from '../../invitation/service/invitation.service';
import { CreateEmailVerificationCodeDto } from '../dto/create-email-verification-code.dto';
import { EmailVerificationCode } from '../entity/email-verification-code.entity';
import { EmailService } from '../../email/service/email.service';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { UserService } from '../../user/service/user.service';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    @InjectRepository(EmailVerificationCode)
    private readonly emailVerificationCodeRepository: Repository<EmailVerificationCode>,
    private readonly invitationService: InvitationService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  async addPhoneVerificationRecord(
    createVerificationCodeDto: CreateVerificationCodeDto,
  ): Promise<typeof VerificationMessageSentSuccessResponse> {
    await this.verificationCodeRepository.save(
      this.verificationCodeRepository.create({
        ...createVerificationCodeDto,
        verification_code: this.generateVerificationCode(),
      }),
    );
    await this.invitationService.create({
      phone_number: createVerificationCodeDto.phone_number,
    });
    return VerificationMessageSentSuccessResponse;
  }

  async addEmailVerificationRecord(
    createEmailVerificationDto: CreateEmailVerificationCodeDto,
  ) {
    const verificationCode = this.generateVerificationCode();
    await this.emailVerificationCodeRepository.save(
      this.emailVerificationCodeRepository.create({
        ...createEmailVerificationDto,
        verification_code: verificationCode,
      }),
    );
    await this.emailService.sendVerificationEmail(
      createEmailVerificationDto.email,
      verificationCode,
    );
    return VerificationMessageSentSuccessResponse;
  }

  async getVerificationCodes(phone: string) {
    return await this.verificationCodeRepository.findBy({
      phone_number: phone,
      expires_at: MoreThan(new Date()),
    });
  }

  async verifyPhoneNumber(verifyPhoneDto: VerifyPhoneDto) {
    try {
      const verificationRecord =
        await this.verificationCodeRepository.findOneByOrFail({
          phone_number: verifyPhoneDto.phone_number,
          verification_code: verifyPhoneDto.verification_code,
          expires_at: MoreThan(new Date()),
        });
      await this.verificationCodeRepository.delete(verificationRecord);
      return VerificationSuccessfulResponse;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto, email: string) {
    try {
      const verificationRecord =
        await this.emailVerificationCodeRepository.findOneByOrFail({
          email: email,
          verification_code: verifyEmailDto.verification_code,
          expires_at: MoreThan(new Date()),
        });
      await this.emailVerificationCodeRepository.delete(verificationRecord.id);
      await this.userService.markUserEmailAsVerified(email);
      return EmailVerificationSuccessfulResponse;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new NotFoundException();
    }
  }

  generateVerificationCode(): string {
    return randomVerificationCodeGenerator(100000, 1000000).toString();
  }
}
