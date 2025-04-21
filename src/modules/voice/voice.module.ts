import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VoiceService } from './service/voice.service';
import { AccessToken } from 'livekit-server-sdk';
import { VoiceController } from './controller/voice.controller';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AccessToken,
      useFactory: (configService: ConfigService) => {
        const at = new AccessToken(
          configService.get('LIVEKIT_API_KEY'),
          configService.get('LIVEKIT_API_SECRET'),
          {
            identity: 'local',
            ttl: '10m',
          },
        );
        at.addGrant({ roomJoin: true, room: 'local-room' });
        return at;
      },
      inject: [ConfigService],
    },
    VoiceService,
  ],
  controllers: [VoiceController],
})
export class VoiceModule {}
