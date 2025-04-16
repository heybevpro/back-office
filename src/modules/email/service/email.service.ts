import { Injectable } from '@nestjs/common';
import { SES } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly sesClient: SES;

  constructor() {
    this.sesClient = new SES({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async sendVerificationEmail(email: string, verificationCode: string) {
    const verificationLink = `${process.env.NEXT_CLIENT_URL}/auth/verify-email?code=${verificationCode}`;
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
  }
}
