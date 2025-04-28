import { Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class VoiceService {
  constructor(private readonly voiceClientAccessToken: AccessToken) {}

  async createToken() {
    const token = await this.voiceClientAccessToken.toJwt();
    return {
      token,
    };
  }
}
