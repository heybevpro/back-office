import {
  Body,
  Controller,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Get,
  Param,
} from '@nestjs/common';
import { EmployeeInvitation } from '../entity/employee-invitation.entity';
import { EmployeeInvitationService } from '../service/employee-invitation.service';
import { CreateEmployeeInvitationDto } from '../dto/employee-invitation.dto';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { CreateEmployeeMetadataDto } from '../dto/employee-metadata.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
    return await this.employeeInvitationService.create(dto);
  }

  @Put('/onboard')
  @UseInterceptors(FileInterceptor('file'))
  async onboard(
    @Body() dto: CreateEmployeeMetadataDto,
    @UploadedFile()
    file: { buffer: Buffer; mimetype: string; originalname: string },
  ): Promise<EmployeeInvitation> {
    return await this.employeeInvitationService.onboard(dto, file);
  }

  @Get('by-venue/:venueId')
  async findAllByVenueId(
    @Param('venueId') venueId: number,
  ): Promise<EmployeeInvitation[]> {
    return await this.employeeInvitationService.findAllByVenueId(venueId);
  }
}
