import { VerificationService } from './verification.service';
import { VerificationCode } from '../entity/verification-code.entity';
import { DeleteResult, MoreThan, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as crypto from 'node:crypto';
import { CreateVerificationCodeDto } from '../dto/create-verification-code.dto';
import { InvitationService } from '../../invitation/service/invitation.service';
import {
  BadRequestException,
  ImATeapotException,
  NotFoundException,
} from '@nestjs/common';
import { EmailService } from '../../email/service/email.service';
import { EmailVerificationCode } from '../entity/email-verification-code.entity';
import { UserService } from '../../user/service/user.service';
import { CreateEmailVerificationCodeDto } from '../dto/create-email-verification-code.dto';
import {
  EmailVerificationSuccessfulResponse,
  PasswordResetEmailSentSuccessResponse,
  VerificationMessageSentSuccessResponse,
} from '../../../utils/constants/api-response.constants';
import { VerifyEmailDto } from '../dto/verify-email.dto';

describe('VerificationService', () => {
  let service: VerificationService;
  let verificationRepository: Repository<VerificationCode>;
  let emailVerificationCodeRepository: Repository<EmailVerificationCode>;

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

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  const mockUserService = {
    markUserEmailAsVerified: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(VerificationCode),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(EmailVerificationCode),
          useClass: Repository,
        },
        VerificationService,
        {
          provide: InvitationService,
          useValue: mockInvitationService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
    verificationRepository = module.get<Repository<VerificationCode>>(
      getRepositoryToken(VerificationCode),
    );
    emailVerificationCodeRepository = module.get(
      getRepositoryToken(EmailVerificationCode),
    );

    const mockedDateObject = new Date('2025-01-01T00:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockedDateObject);
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
    // const expiryBound = ;
    const response = await service.getVerificationCodes('<_VALID_PHONE_>');
    expect(response).toEqual([mockVerificationRecord]);
    expect(findVerificationCodesSpy).toHaveBeenCalledWith({
      phone_number: '<_VALID_PHONE_>',
      expires_at: MoreThan(new Date()),
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

  describe('addEmailVerificationRecord', () => {
    it('should save an email verification record and send an email', async () => {
      const createEmailVerificationCodeDto: CreateEmailVerificationCodeDto = {
        email: 'test@example.com',
      };
      const mockVerificationCode = '123456';

      const mockEmailVerificationRecord: EmailVerificationCode = {
        id: 1,
        email: 'email@verify.com',
        verification_code: mockVerificationCode,
        expires_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const createVerificationCodeSpy = jest.spyOn(
        emailVerificationCodeRepository,
        'create',
      );
      const saveVerificationCodeSpy = jest.spyOn(
        emailVerificationCodeRepository,
        'save',
      );
      jest
        .spyOn(service, 'generateVerificationCode')
        .mockReturnValue(mockVerificationCode);
      createVerificationCodeSpy.mockReturnValue(mockEmailVerificationRecord);
      saveVerificationCodeSpy.mockResolvedValue(mockEmailVerificationRecord);

      const result = await service.addEmailVerificationRecord(
        createEmailVerificationCodeDto,
      );

      expect(emailVerificationCodeRepository.create).toHaveBeenCalledWith({
        ...createEmailVerificationCodeDto,
        verification_code: mockVerificationCode,
      });
      expect(emailVerificationCodeRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        createEmailVerificationCodeDto.email,
        mockVerificationCode,
      );
      expect(result).toEqual(VerificationMessageSentSuccessResponse);
    });
  });

  describe('verifyEmail', () => {
    let verifyEmailDto: VerifyEmailDto;
    let email: string;
    let mockEmailVerificationRecord: EmailVerificationCode;

    let emailVerificationRecordFindOneByOrFailSpy: jest.SpyInstance;
    let emailRecordDeleteSpy: jest.SpyInstance;
    beforeEach(() => {
      verifyEmailDto = {
        verification_code: '123456',
      };
      email = 'email@domain.com';
      mockEmailVerificationRecord = {
        id: 1,
        email: email,
        verification_code: verifyEmailDto.verification_code,
        expires_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      emailVerificationRecordFindOneByOrFailSpy = jest.spyOn(
        emailVerificationCodeRepository,
        'findOneByOrFail',
      );
      emailRecordDeleteSpy = jest.spyOn(
        emailVerificationCodeRepository,
        'delete',
      );
    });
    it('should validate the email verification code and delete the record', async () => {
      emailRecordDeleteSpy.mockResolvedValue({} as DeleteResult);
      emailVerificationRecordFindOneByOrFailSpy.mockResolvedValue(
        mockEmailVerificationRecord,
      );

      expect(await service.verifyEmail(verifyEmailDto, email)).toEqual(
        EmailVerificationSuccessfulResponse,
      );
      expect(emailVerificationRecordFindOneByOrFailSpy).toHaveBeenCalledWith({
        email: email,
        verification_code: verifyEmailDto.verification_code,
        expires_at: MoreThan(new Date()),
      });
    });

    it('should throw NotFoundException if verification record is not found', async () => {
      emailRecordDeleteSpy.mockResolvedValue({} as DeleteResult);
      emailVerificationRecordFindOneByOrFailSpy.mockRejectedValue(
        new ImATeapotException(),
      );

      await expect(service.verifyEmail(verifyEmailDto, email)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete the verification record', async () => {
      emailRecordDeleteSpy.mockResolvedValue({} as DeleteResult);
      emailVerificationRecordFindOneByOrFailSpy.mockResolvedValue(
        mockEmailVerificationRecord,
      );
      await service.verifyEmail(verifyEmailDto, email);
      expect(emailRecordDeleteSpy).toHaveBeenCalledWith(
        mockEmailVerificationRecord.id,
      );
    });
    it('should not delete the verification record if the workflow gets interrupted', async () => {
      emailRecordDeleteSpy.mockResolvedValue({} as DeleteResult);
      emailVerificationRecordFindOneByOrFailSpy.mockRejectedValue(
        new ImATeapotException(),
      );
      await expect(service.verifyEmail(verifyEmailDto, email)).rejects.toThrow(
        NotFoundException,
      );
      expect(emailRecordDeleteSpy).not.toHaveBeenCalled();
    });
  });

  describe('createPasswordResetRequest', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should return a successful response', async () => {
      const mockEmailVerificationRecord: EmailVerificationCode = {
        email: 'test@email.com',
        verification_code: 'VALID-VERIFICATION-CODE',
        id: 1,
        created_at: new Date(),
        expires_at: new Date(),
        updated_at: new Date(),
      };
      jest
        .spyOn(emailVerificationCodeRepository, 'create')
        .mockReturnValue(mockEmailVerificationRecord);
      jest
        .spyOn(emailVerificationCodeRepository, 'save')
        .mockResolvedValue(mockEmailVerificationRecord);
      expect(
        await service.createPasswordResetRequest('test@email.com'),
      ).toEqual(PasswordResetEmailSentSuccessResponse);
    });

    it('should call the EmailService to send the password reset email', async () => {
      const mockEmailVerificationRecord: EmailVerificationCode = {
        email: 'test@email.com',
        verification_code: 'VALID-VERIFICATION-CODE',
        id: 1,
        created_at: new Date(),
        expires_at: new Date(),
        updated_at: new Date(),
      };
      jest
        .spyOn(emailVerificationCodeRepository, 'create')
        .mockReturnValue(mockEmailVerificationRecord);
      jest
        .spyOn(emailVerificationCodeRepository, 'save')
        .mockResolvedValue(mockEmailVerificationRecord);
      await service.createPasswordResetRequest('test@email.com');

      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  describe('findPasswordResetRequestByCode', () => {
    it('should return a Reset Request if found', async () => {
      const mockCodeToFind = 'VALID-VERIFICATION-CODE';
      const mockEmailVerificationRecord: EmailVerificationCode = {
        email: 'test@email.com',
        verification_code: 'VALID-VERIFICATION-CODE',
        id: 1,
        created_at: new Date(),
        expires_at: new Date(),
        updated_at: new Date(),
      };
      const findOneByOrFailSpy = jest.spyOn(
        emailVerificationCodeRepository,
        'findOneBy',
      );
      findOneByOrFailSpy.mockResolvedValue(mockEmailVerificationRecord);
      expect(
        await service.findPasswordResetRequestByCode(mockCodeToFind),
      ).toEqual(mockEmailVerificationRecord);
    });

    it('should throw a NotFoundException if Verification Record is not found', async () => {
      const mockCodeToFind = 'VALID-VERIFICATION-CODE';
      const findOneByOrFailSpy = jest.spyOn(
        emailVerificationCodeRepository,
        'findOneBy',
      );
      findOneByOrFailSpy.mockResolvedValue(null);
      await expect(
        service.findPasswordResetRequestByCode(mockCodeToFind),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
