import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EmployeeInvitation } from '../entity/employee-invitation.entity';
import { EmployeeInvitationService } from '../service/employee-invitation.service';
import { CreateEmployeeInvitationDto } from '../dto/employee-invitation.dto';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('employee-invitation')
export class EmployeeInvitationController {
  constructor(
    private readonly employeeInvitationService: EmployeeInvitationService,
  ) {}

  @Post('/send-invitation')
  async sendInvite(
    @Body() dto: CreateEmployeeInvitationDto,
  ): Promise<EmployeeInvitation> {
    return this.employeeInvitationService.create(dto);
  }
}
