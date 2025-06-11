import {
  Body,
  Controller,
  Get,
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

  @Put('/review-invitation')
  async updateStatus(@Body() dto: UpdateInvitationStatusDto) {
    return await this.employeeInvitationService.updateStatusUsingVerification(
      dto,
    );
  }

  @Get('/get-status')
  async getStatus(@Body() dto: LoginDto) {
    return await this.employeeInvitationService.findByInvitationPin(dto);
  }
}
