import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InvitationService } from '../service/invitation.service';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { Invitation } from '../entity/invitation.entity';
import { CreateInvitationDto } from '../dto/create-invitation.dto';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Array<Invitation>> {
    return await this.invitationService.fetchAll();
  }

  @Post('/create')
  async create(
    @Body() createInvitationDto: CreateInvitationDto,
  ): Promise<Invitation> {
    return await this.invitationService.create(createInvitationDto);
  }
}
