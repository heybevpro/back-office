import { VoiceService } from './voice.service';
import { Test } from '@nestjs/testing';
import { AccessToken } from 'livekit-server-sdk';

describe('VoiceService', () => {
  let service: VoiceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [VoiceService, { provide: AccessToken, useValue: {} }],
    }).compile();

    service = module.get<VoiceService>(VoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
