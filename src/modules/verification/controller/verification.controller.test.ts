import { Test, TestingModule } from '@nestjs/testing';
import { VerificationController } from './verification.controller';
import { VerificationService } from '../service/verification.service';
import { CreateVerificationCodeDto } from '../dto/create-verification-code.dto';
import { HttpStatus } from '@nestjs/common';

describe('VerificationController', () => {
  let verificationController: VerificationController;
  let verificationService: VerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationController],
      providers: [
        {
          provide: VerificationService,
          useValue: {
            addPhoneVerificationRecord: jest.fn().mockResolvedValue({
              message: 'Verification Message Sent!',
              status: HttpStatus.CREATED,
            }),
          },
        },
      ],
    }).compile();

    verificationController = module.get<VerificationController>(
      VerificationController,
    );
    verificationService = module.get<VerificationService>(VerificationService);
  });

  it('should be defined', () => {
    expect(verificationController).toBeDefined();
  });

  describe('request', () => {
    it('should return a success message and status', async () => {
      const createVerificationCodeDto: CreateVerificationCodeDto = {
        phone_number: '1234567890',
        expires_at: new Date(),
      };

      const result = await verificationController.request(
        createVerificationCodeDto,
      );

      expect(result).toEqual({
        message: 'Verification Message Sent!',
        status: HttpStatus.CREATED,
      });
      expect(
        verificationService.addPhoneVerificationRecord,
      ).toHaveBeenCalledWith(createVerificationCodeDto);
    });
  });
});
