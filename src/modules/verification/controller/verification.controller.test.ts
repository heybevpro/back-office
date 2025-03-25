import { Test, TestingModule } from '@nestjs/testing';
import { VerificationController } from './verification.controller';
import { VerificationService } from '../service/verification.service';
import { CreateVerificationCodeDto } from '../dto/create-verification-code.dto';
import { VerificationMessageSentSuccessResponse } from '../../../utils/constants/api-response.constants';

describe('VerificationController', () => {
  let verificationController: VerificationController;
  let verificationService: VerificationService;

  const mockVerificationService = {
    addPhoneVerificationRecord: jest
      .fn()
      .mockResolvedValue(VerificationMessageSentSuccessResponse),
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

      expect(result).toEqual(VerificationMessageSentSuccessResponse);
      expect(
        // eslint-disable-next-line @typescript-eslint/unbound-method
        verificationService.addPhoneVerificationRecord,
      ).toHaveBeenCalledWith(createVerificationCodeDto);
    });
  });
});
