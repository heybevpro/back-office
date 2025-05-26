import { Module } from '@nestjs/common';
import { ObjectStoreService } from './service/object-store.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from '../../utils/constants/environmentType';
import { S3Upload } from 'livekit-server-sdk';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3Upload,
      useFactory: (configService: ConfigService) => {
        return new S3Upload(
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
