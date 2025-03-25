import { Controller, Get, UseGuards } from '@nestjs/common';
import { InvitationService } from '../service/invitation.service';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.invitationService.fetchAll();
  }
}
