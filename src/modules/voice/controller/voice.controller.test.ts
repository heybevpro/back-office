import { Test, TestingModule } from '@nestjs/testing';
import { VoiceController } from './voice.controller';
import { VoiceService } from '../service/voice.service';

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
      const mockToken = { token: 'VOICE-SERVICE-JWT-TOKEN' };
      jest.spyOn(service, 'createToken').mockResolvedValue(mockToken);

      const result = await controller.getToken();

      expect(service.createToken).toHaveBeenCalled();
      expect(result).toBe(mockToken);
    });
  });
});
