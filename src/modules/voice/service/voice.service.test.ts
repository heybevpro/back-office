import { VoiceService } from './voice.service';
import { Test } from '@nestjs/testing';
import { AccessToken } from 'livekit-server-sdk';

describe('VoiceService', () => {
  let service: VoiceService;

  const mockVoiceClientAccessToken = {
    toJwt: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VoiceService,
        { provide: AccessToken, useValue: mockVoiceClientAccessToken },
      ],
    }).compile();

    service = module.get<VoiceService>(VoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createToken for VoiceAgent', () => {
    it('should return the JWT token for the Voice Agent', async () => {
      const mockToken = '<_MOCK-ACCESS-TOKEN_>';
      jest
        .spyOn(mockVoiceClientAccessToken, 'toJwt')
        .mockResolvedValue(mockToken);
      expect(await service.createToken()).toEqual({ token: mockToken });
    });
  });
});
