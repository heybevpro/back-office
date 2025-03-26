import { VerificationService } from './verification.service';
import { VerificationCode } from '../entity/verification-code.entity';
import { DeleteResult, MoreThan, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as crypto from 'node:crypto';
import { CreateVerificationCodeDto } from '../dto/create-verification-code.dto';
import { InvitationService } from '../../invitation/service/invitation.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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

  const mockInvitationService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(VerificationCode),
          useClass: Repository,
        },
        VerificationService,
        {
          provide: InvitationService,
          useValue: mockInvitationService,
        },
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

  it('should return all valid verification codes, for a given phone number', async () => {
    const findVerificationCodesSpy = jest.spyOn(
      verificationRepository,
      'findBy',
    );
    findVerificationCodesSpy.mockResolvedValue([mockVerificationRecord]);
    const expiryBound = MoreThan(new Date());
    const response = await service.getVerificationCodes('<_VALID_PHONE_>');
    expect(response).toEqual([mockVerificationRecord]);
    expect(findVerificationCodesSpy).toHaveBeenCalledWith({
      phone_number: '<_VALID_PHONE_>',
      expires_at: expiryBound,
    });
  });

  it('should delete verification record if found', async () => {
    const findVerificationCodeSpy = jest.spyOn(
      verificationRepository,
      'findOneByOrFail',
    );
    const deleteRecordSpy = jest.spyOn(verificationRepository, 'delete');
    findVerificationCodeSpy.mockResolvedValue(mockVerificationRecord);
    deleteRecordSpy.mockResolvedValue({} as DeleteResult);

    await service.verifyPhoneNumber(mockVerificationRequestPayload);
    expect(deleteRecordSpy).toHaveBeenCalledWith(mockVerificationRecord);
  });

  it('should throw a NotFoundException if verification record is not found', async () => {
    const findVerificationCodeSpy = jest.spyOn(
      verificationRepository,
      'findOneByOrFail',
    );
    findVerificationCodeSpy.mockRejectedValue(new BadRequestException());

    await expect(
      service.verifyPhoneNumber({
        phone_number: '<_VALID_PHONE_>',
        verification_code: '<_INVALID_CODE_>',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
