import { VoiceService } from './voice.service';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

jest.mock('livekit-server-sdk', () => ({
  AccessToken: jest.fn().mockImplementation(() => ({
    addGrant: jest.fn(),
    toJwt: jest.fn().mockResolvedValue('<_MOCK-ACCESS-TOKEN_>'),
  })),
}));

describe('VoiceService', () => {
  let service: VoiceService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'LIVEKIT_API_KEY') return '<_MOCK-API-KEY_>';
      if (key === 'LIVEKIT_API_SECRET') return '<_MOCK-API-SECRET_>';
      return null;
    }),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VoiceService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<VoiceService>(VoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createToken for VoiceAgent', () => {
    it('should return the JWT token for the Voice Agent', async () => {
      const mockUserId = '<_VALID-USER-ID_>';
      const mockToken = '<_MOCK-ACCESS-TOKEN_>';
      const result = await service.createToken(mockUserId);
      expect(AccessToken).toHaveBeenCalledWith(
        '<_MOCK-API-KEY_>',
        '<_MOCK-API-SECRET_>',
        {
          identity: `root-${mockUserId}`,
          metadata: `{"platform": "web"}`,
          ttl: '10m',
        },
      );
      expect(result).toEqual({
        token: mockToken,
      });
    });
  });
});
