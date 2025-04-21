import { Injectable } from '@nestjs/common';
import { SES } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';
import { FailedToSendEmailException } from '../../../excpetions/credentials.exception';

@Injectable()
export class EmailService {
  constructor(
    private readonly sesClient: SES,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, verificationCode: string) {
    const verificationLink = `${this.configService.get('NEXT_CLIENT_URL')}/auth/verify-email?code=${verificationCode}`;
    try {
      await this.sesClient.sendEmail({
        Source: 'hey@hey-bev.com',
        Message: {
          Body: {
            Text: {
              Data: `Thank you for signing up! To complete your registration, please confirm your email by clicking the link below. ${verificationLink}`,
            },
          },
          Subject: { Data: 'BevPro: Confirm Your Email.' },
        },
        Destination: { ToAddresses: [email] },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      throw new FailedToSendEmailException();
    }
  }
}
