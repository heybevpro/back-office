import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { VoiceService } from '../service/voice.service';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { User } from '../../user/entity/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Get('token')
  getToken(@Request() request: { user: User }) {
    return this.voiceService.createToken(request.user.id);
  }

  @Get('token/pos/venue/:venueId')
  getTokenPOS(
    @Request() request: { user: User },
    @Param('venueId', new ParseIntPipe()) venueId: number,
  ) {
    return this.voiceService.createTokenPOS(request.user.id, venueId);
  }
}
