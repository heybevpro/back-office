import { Injectable, NotFoundException } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { VerificationCode } from '../entity/verification-code.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt as randomVerificationCodeGenerator } from 'node:crypto';
import { CreateVerificationCodeDto } from '../dto/create-verification-code.dto';
import {
  VerificationMessageSentSuccessResponse,
  VerificationMSuccessfulResponse,
} from '../../../utils/constants/api-response.constants';
import { VerifyPhoneDto } from '../dto/verify-phone.dto';
import { InvitationService } from '../../invitation/service/invitation.service';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly invitationService: InvitationService,
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
      return VerificationMSuccessfulResponse;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  generateVerificationCode(): string {
    return randomVerificationCodeGenerator(100000, 1000000).toString();
  }
}
