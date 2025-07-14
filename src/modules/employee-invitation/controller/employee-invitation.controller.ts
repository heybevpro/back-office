import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EmployeeInvitation } from '../entity/employee-invitation.entity';
import { EmployeeInvitationService } from '../service/employee-invitation.service';
import {
  CreateEmployeeInvitationDto,
  LoginDto,
  UpdateInvitationStatusDto,
} from '../dto/employee-invitation.dto';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { CreateEmployeeMetadataDto } from '../dto/employee-metadata.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('employee-invitation')
export class EmployeeInvitationController {
  constructor(
    private readonly employeeInvitationService: EmployeeInvitationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/send-invitation')
  async sendInvite(
    @Body() dto: CreateEmployeeInvitationDto,
  ): Promise<EmployeeInvitation> {
    return await this.employeeInvitationService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/onboard')
  @UseInterceptors(FileInterceptor('file'))
  async onboard(
    @Body() dto: CreateEmployeeMetadataDto,
    @UploadedFile()
    file: { buffer: Buffer; mimetype: string; originalname: string },
  ): Promise<EmployeeInvitation> {
    return await this.employeeInvitationService.onboard(dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-venue/:venueId')
  async findAllByVenueId(
    @Param('venueId') venueId: number,
  ): Promise<EmployeeInvitation[]> {
    return await this.employeeInvitationService.findAllByVenueId(venueId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':invitationId')
  async findInvitationById(
    @Param('invitationId') invitationId: string,
  ): Promise<EmployeeInvitation> {
    return await this.employeeInvitationService.findInvitationId(invitationId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/review-invitation')
  async updateStatus(@Body() dto: UpdateInvitationStatusDto) {
    return await this.employeeInvitationService.updateStatusUsingVerification(
      dto,
    );
  }

  @Post('/login')
  async getStatus(@Body() dto: LoginDto) {
    return await this.employeeInvitationService.findByInvitationPin(dto);
  }
}
