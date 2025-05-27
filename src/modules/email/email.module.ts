import { Module } from '@nestjs/common';
import { EmailService } from './service/email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SES, SESClientConfig } from '@aws-sdk/client-ses';
import { EnvironmentVariable } from '../../utils/constants/environmentType';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SES,
      useFactory: (configService: ConfigService): SES => {
        const sesConfig = configService.get<SESClientConfig>(
          EnvironmentVariable.CLOUD_PROVIDER_CONFIGURATION,
        );

        if (!sesConfig) {
          throw new Error(
            `Missing SES configuration for key: ${EnvironmentVariable.CLOUD_PROVIDER_CONFIGURATION}`,
          );
        }

        return new SES(sesConfig);
      },
      inject: [ConfigService],
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
