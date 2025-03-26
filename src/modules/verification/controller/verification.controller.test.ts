import { Test, TestingModule } from '@nestjs/testing';
import { VerificationController } from './verification.controller';
import { VerificationService } from '../service/verification.service';
import { CreateVerificationCodeDto } from '../dto/create-verification-code.dto';
import { VerificationMessageSentSuccessResponse } from '../../../utils/constants/api-response.constants';

describe('VerificationController', () => {
  let controller: VerificationController;

  const mockVerificationService = {
    addPhoneVerificationRecord: jest
      .fn()
      .mockResolvedValue(VerificationMessageSentSuccessResponse),
    verifyPhoneNumber: jest
      .fn()
      .mockResolvedValue(VerificationMessageSentSuccessResponse),
    getVerificationCodes: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationController],
      providers: [
        {
          provide: VerificationService,
          useValue: mockVerificationService,
        },
      ],
    }).compile();

    controller = module.get<VerificationController>(VerificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('request', () => {
    it('should return a success message and status', async () => {
      const createVerificationCodeDto: CreateVerificationCodeDto = {
        phone_number: '1234567890',
        expires_at: new Date(),
      };

      const result = await controller.request(createVerificationCodeDto);

      expect(result).toEqual(VerificationMessageSentSuccessResponse);
      expect(
        mockVerificationService.addPhoneVerificationRecord,
      ).toHaveBeenCalledWith(createVerificationCodeDto);
    });
  });

  it('should verify the one-time code using the verifyPhoneNumber method from Verification Service', async () => {
    const mockVerifyRequestBody = {
      phone_number: '<_VALID-PHONE_>',
      verification_code: '<_VERIFICATION-CODE_>',
    };
    const response = await controller.verify(mockVerifyRequestBody);
    expect(response).toEqual(VerificationMessageSentSuccessResponse);
    expect(mockVerificationService.verifyPhoneNumber).toHaveBeenCalledWith(
      mockVerifyRequestBody,
    );
  });

  it('is [INTERNAL-ONLY] -> should fetch all valid verification codes', async () => {
    await controller.getValidRecords('<_VALID-PHONE_>');
    expect(mockVerificationService.getVerificationCodes).toHaveBeenCalledWith(
      '<_VALID-PHONE_>',
    );
  });
});
