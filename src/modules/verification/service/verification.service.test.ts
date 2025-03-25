import { VerificationService } from './verification.service';
import { VerificationCode } from '../entity/verification-code.entity';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as crypto from 'node:crypto';
import { CreateVerificationCodeDto } from '../dto/create-verification-code.dto';

describe('VerificationService', () => {
  let service: VerificationService;
  let verificationRepository: Repository<VerificationCode>;

  const mockVerificationRequestPayload: CreateVerificationCodeDto & {
    verification_code: string;
  } = {
    phone_number: '+12222222222',
    expires_at: new Date(),
    verification_code: expect.stringMatching(
      new RegExp(`^\\d{6}$`),
    ) as unknown as string,
  };

  const mockVerificationRecord: VerificationCode = {
    id: 1,
    phone_number: '+12222222222',
    verification_code: '<_VERIFICATION_CODE_>',
    created_at: new Date(),
    expires_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(VerificationCode),
          useClass: Repository,
        },
        VerificationService,
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
    verificationRepository = module.get<Repository<VerificationCode>>(
      getRepositoryToken(VerificationCode),
    );
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a random 6 digit verificationCode', () => {
    expect(service.generateVerificationCode()).toHaveLength(6);
  });

  it('should generate a verification code using NodeJS crypto library', () => {
    jest.mock('node:crypto');

    const generateRandomCodeSpy = jest.spyOn(crypto, 'randomInt');

    service.generateVerificationCode();
    expect(generateRandomCodeSpy).toHaveBeenCalledWith(100000, 1000000);
  });

  it('should create and save the verification code record', async () => {
    const createVerificationRecordSpy = jest.spyOn(
      verificationRepository,
      'create',
    );
    const saveVerificationRecordSpy = jest.spyOn(
      verificationRepository,
      'save',
    );
    createVerificationRecordSpy.mockReturnValue(mockVerificationRecord);
    saveVerificationRecordSpy.mockResolvedValue(mockVerificationRecord);
    await service.addPhoneVerificationRecord(mockVerificationRequestPayload);
    expect(createVerificationRecordSpy).toHaveBeenCalledWith(
      mockVerificationRequestPayload,
    );
  });
});
