import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { SES } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';
import { FailedToSendEmailException } from '../../../excpetions/credentials.exception';

jest.mock('@aws-sdk/client-ses');

describe('EmailService', () => {
  let service: EmailService;
  let sesClientMock: jest.Mocked<SES>;
  let configServiceMock: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    configServiceMock = {
      get: jest.fn((key: string) => {
        if (key === 'NEXT_CLIENT_URL') {
          return 'https://example.com';
        }
        if (key === 'EMAIL_CLIENT_CONFIGURATION') {
          return { region: 'us-east-1' };
        }
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: configServiceMock },
        {
          provide: SES,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    sesClientMock = module.get<SES>(SES) as jest.Mocked<SES>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should send an email with the correct parameters', async () => {
      sesClientMock.sendEmail.mockResolvedValue({} as never);

      const email = 'test@example.com';
      const verificationCode = '123456';
      const expectedLink = `https://example.com/auth/verify-email?code=${verificationCode}`;

      await service.sendVerificationEmail(email, verificationCode);

      expect(sesClientMock.sendEmail).toHaveBeenCalledWith({
        Source: 'hey@hey-bev.com',
        Message: {
          Body: {
            Text: {
              Data: `Thank you for signing up! To complete your registration, please confirm your email by clicking the link below. ${expectedLink}`,
            },
          },
          Subject: { Data: 'BevPro: Confirm Your Email.' },
        },
        Destination: { ToAddresses: [email] },
      });
    });

    it('should throw a FailedToSendEmailException if SES fails', async () => {
      sesClientMock.sendEmail.mockRejectedValue(
        new Error('SES Error') as never,
      );

      const email = 'test@example.com';
      const verificationCode = '123456';

      await expect(
        service.sendVerificationEmail(email, verificationCode),
      ).rejects.toThrow(FailedToSendEmailException);

      expect(sesClientMock.sendEmail).toHaveBeenCalled();
    });
  });

  describe('sendPasswordResetEmail', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should send an email with the correct parameters', async () => {
      sesClientMock.sendEmail.mockResolvedValue({} as never);

      const email = 'test@example.com';
      const verificationCode = 'VALID_VERIFICATION_CODE';
      const expectedLink = `https://example.com/auth/reset-password?code=${verificationCode}`;

      await service.sendPasswordResetEmail(email, verificationCode);

      expect(sesClientMock.sendEmail).toHaveBeenCalledWith({
        Source: 'hey@hey-bev.com',
        Message: {
          Body: {
            Text: {
              Data: `Click the link to reset your password: ${expectedLink}`,
            },
          },
          Subject: { Data: 'BevPro: Reset Password' },
        },
        Destination: { ToAddresses: [email.toLowerCase()] },
      });
    });

    it('should throw a FailedToSendEmailException if SES fails', async () => {
      sesClientMock.sendEmail.mockRejectedValue(
        new Error('SES Error') as never,
      );

      const email = 'test@example.com';
      const verificationCode = '123456';

      await expect(
        service.sendPasswordResetEmail(email, verificationCode),
      ).rejects.toThrow(FailedToSendEmailException);

      expect(sesClientMock.sendEmail).toHaveBeenCalled();
    });
  });
});
