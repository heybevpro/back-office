import { Test, TestingModule } from '@nestjs/testing';
import { VoiceController } from './voice.controller';
import { VoiceService } from '../service/voice.service';
import { User } from '../../user/entity/user.entity';

describe('VoiceController', () => {
  let controller: VoiceController;
  let service: VoiceService;

  const mockVoiceService = {
    createToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiceController],
      providers: [
        {
          provide: VoiceService,
          useValue: mockVoiceService,
        },
      ],
    }).compile();

    controller = module.get<VoiceController>(VoiceController);
    service = module.get<VoiceService>(VoiceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getToken', () => {
    it('should return a token from the service', async () => {
      const mockResponse = { token: 'VOICE-SERVICE-JWT-TOKEN' };
      const mockRequest = {
        user: {
          id: 'VALID-USER-ID',
        } as unknown as User,
      };
      jest.spyOn(service, 'createToken').mockResolvedValue(mockResponse);

      const result = await controller.getToken(mockRequest);

      expect(service.createToken).toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });
  });
});
