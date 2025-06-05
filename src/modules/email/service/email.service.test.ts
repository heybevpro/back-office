import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { SES } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';
import { FailedToSendEmailException } from '../../../excpetions/credentials.exception';
import { EmailTemplates } from '../../../utils/constants/email.constants';

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
            sendTemplatedEmail: jest.fn(),
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
      sesClientMock.sendTemplatedEmail.mockResolvedValue({} as never);

      const email = 'test@example.com';
      const verificationCode = '123456';
      const verificationUrl = `https://example.com/auth/verify-email?code=${verificationCode}`;

      await service.sendVerificationEmail(email, verificationCode);

      expect(sesClientMock.sendTemplatedEmail).toHaveBeenCalledWith({
        Source: 'hey@hey-bev.com',
        Template: EmailTemplates.VerifyEmail,
        TemplateData: JSON.stringify({ verificationUrl }),
        Destination: { ToAddresses: [email.toLowerCase()] },
      });
    });

    it('should throw a FailedToSendEmailException if SES fails', async () => {
      sesClientMock.sendTemplatedEmail.mockRejectedValue(
        new Error('SES Error') as never,
      );

      const email = 'test@example.com';
      const verificationCode = '123456';

      await expect(
        service.sendVerificationEmail(email, verificationCode),
      ).rejects.toThrow(FailedToSendEmailException);

      expect(sesClientMock.sendTemplatedEmail).toHaveBeenCalled();
    });
  });

  describe('sendPasswordResetEmail', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should send an email with the correct parameters', async () => {
      sesClientMock.sendTemplatedEmail.mockResolvedValue({} as never);

      const email = 'test@example.com';
      const verificationCode = 'VALID_VERIFICATION_CODE';
      const resetUrl = `https://example.com/auth/reset-password?code=${verificationCode}`;

      await service.sendPasswordResetEmail(email, verificationCode);

      expect(sesClientMock.sendTemplatedEmail).toHaveBeenCalledWith({
        Source: 'hey@hey-bev.com',
        Template: EmailTemplates.ResetPassword,
        TemplateData: JSON.stringify({ resetUrl }),
        Destination: { ToAddresses: [email.toLowerCase()] },
      });
    });

    it('should throw a FailedToSendEmailException if SES fails', async () => {
      sesClientMock.sendTemplatedEmail.mockRejectedValue(
        new Error('SES Error') as never,
      );

      const email = 'test@example.com';
      const verificationCode = '123456';

      await expect(
        service.sendPasswordResetEmail(email, verificationCode),
      ).rejects.toThrow(FailedToSendEmailException);

      expect(sesClientMock.sendTemplatedEmail).toHaveBeenCalled();
    });
  });

  describe('sendEmployeeInvitationEmail', () => {
    it('should send an invitation email with correct parameters', async () => {
      sesClientMock.sendTemplatedEmail.mockResolvedValue({} as never);

      const email = 'testuser@example.com';
      const pin = '654321';
      const organizationName = 'Test Org';
      const inviteVerificationUrl = `https://example.com/lead/join?pin=${pin}`;

      await service.sendEmployeeInvitationEmail(email, pin, organizationName);

      expect(sesClientMock.sendTemplatedEmail).toHaveBeenCalledWith({
        Source: 'hey@hey-bev.com',
        Template: EmailTemplates.EmployeeInvitation,
        TemplateData: JSON.stringify({
          pin,
          organizationName,
          inviteVerificationUrl,
        }),
        Destination: { ToAddresses: [email.toLowerCase()] },
      });
    });

    it('should throw a FailedToSendEmailException if SES fails', async () => {
      sesClientMock.sendTemplatedEmail.mockRejectedValue(
        new Error('SES Failure') as never,
      );

      const email = 'testuser@example.com';
      const pin = '654321';
      const organizationName = 'Test Org';

      await expect(
        service.sendEmployeeInvitationEmail(email, pin, organizationName),
      ).rejects.toThrow(FailedToSendEmailException);

      expect(sesClientMock.sendTemplatedEmail).toHaveBeenCalled();
    });
  });
});
