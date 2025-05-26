import { Module } from '@nestjs/common';
import { ObjectStoreService } from './service/objectStore.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from '../../utils/constants/environmentType';
import { S3Upload } from 'livekit-server-sdk';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3Upload,
      useFactory: (configService) => {
        return new S3Upload(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-argument
          configService.get(EnvironmentVariable.CLOUD_PROVIDER_CONFIGURATION),
        );
      },
      inject: [ConfigService],
    },
    ObjectStoreService,
  ],
  exports: [ObjectStoreService],
})
export class ObjectStoreModule {}
