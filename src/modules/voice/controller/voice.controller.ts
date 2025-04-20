import { Controller, Get } from '@nestjs/common';
import { VoiceService } from '../service/voice.service';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Get('token')
  getToken() {
    return this.voiceService.createToken();
  }
}
