import { Module } from '@nestjs/common';
import { EmailService } from './service/email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SES } from '@aws-sdk/client-ses';
import { EnvironmentVariable } from '../../utils/constants/environmentType';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SES,
      useFactory: (configService) => {
        return new SES(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-argument
          configService.get(EnvironmentVariable.EMAIL_CLIENT_CONFIGURATION),
        );
      },
      inject: [ConfigService],
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
