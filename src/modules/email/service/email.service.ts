import { Injectable } from '@nestjs/common';
import { SES } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';
import { FailedToSendEmailException } from '../../../excpetions/credentials.exception';
import { EmailTemplates } from '../../../utils/constants/email.constants';

@Injectable()
export class EmailService {
  constructor(
    private readonly sesClient: SES,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, verificationCode: string) {
    const verificationUrl = `${this.configService.get('NEXT_CLIENT_URL')}/auth/verify-email?code=${verificationCode}`;
    try {
      await this.sesClient.sendTemplatedEmail({
        Source: 'hey@hey-bev.com',
        Template: EmailTemplates.VerifyEmail,
        TemplateData: JSON.stringify({ verificationUrl }),
        Destination: { ToAddresses: [email.toLowerCase()] },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      throw new FailedToSendEmailException();
    }
  }

  async sendPasswordResetEmail(email: string, verificationCode: string) {
    const resetUrl = `${this.configService.get('NEXT_CLIENT_URL')}/auth/reset-password?code=${verificationCode}`;
    try {
      await this.sesClient.sendTemplatedEmail({
        Source: 'hey@hey-bev.com',
        Template: EmailTemplates.ResetPassword,
        TemplateData: JSON.stringify({ resetUrl }),
        Destination: { ToAddresses: [email.toLowerCase()] },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      throw new FailedToSendEmailException();
    }
  }

  async sendEmployeeInvitationEmail(
    email: string,
    pin: string,
    organizationName: string,
  ) {
    const inviteVerificationUrl = `${this.configService.get('NEXT_CLIENT_URL')}/lead/join?pin=${pin}`;
    try {
      await this.sesClient.sendTemplatedEmail({
        Source: 'hey@hey-bev.com',
        Template: EmailTemplates.EmployeeInvitation,
        TemplateData: JSON.stringify({
          pin,
          organizationName,
          inviteVerificationUrl,
        }),
        Destination: { ToAddresses: [email.toLowerCase()] },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new FailedToSendEmailException();
    }
  }
}
