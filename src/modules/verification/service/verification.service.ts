import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VerificationCode } from '../entity/verification-code.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt as randomVerificationCodeGenerator } from 'node:crypto';
import { CreateVerificationCodeDto } from '../dto/create-verification-code.dto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
  ) {}

  addPhoneVerificationRecord = async (
    createVerificationCodeDto: CreateVerificationCodeDto,
  ) => {
    await this.verificationCodeRepository.save(
      this.verificationCodeRepository.create({
        ...createVerificationCodeDto,
        verification_code: this.generateVerificationCode(),
      }),
    );
    return {
      message: 'Verification Message Sent!',
      status: HttpStatus.CREATED,
    };
  };

  readonly generateVerificationCode = (): string => {
    return randomVerificationCodeGenerator(100000, 1000000).toString();
  };
}
