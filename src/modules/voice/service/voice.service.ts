import { Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VoiceService {
  constructor(private readonly configService: ConfigService) {}

  async createToken(userId: string): Promise<{ token: string }> {
    const at = new AccessToken(
      this.configService.get('LIVEKIT_API_KEY'),
      this.configService.get('LIVEKIT_API_SECRET'),
      {
        identity: `root-${userId}`,
        attributes: {
          platform: 'web',
        },
        ttl: '10m',
      },
    );
    at.addGrant({
      roomJoin: true,
      room: `bev-${userId}`,
    });
    const token = await at.toJwt();
    return {
      token,
    };
  }

  async createTokenPOS(
    userId: string,
    venueId: number,
  ): Promise<{ token: string }> {
    const at = new AccessToken(
      this.configService.get('LIVEKIT_API_KEY'),
      this.configService.get('LIVEKIT_API_SECRET'),
      {
        identity: `pos-${userId}`,
        attributes: {
          venue: venueId.toString(),
          platform: 'web',
        },
        ttl: '10m',
      },
    );
    at.addGrant({
      roomJoin: true,
      room: `bev-${userId}`,
      roomRecord: false,
    });
    const token = await at.toJwt();
    return {
      token,
    };
  }
}
