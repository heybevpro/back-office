import {
  IsBoolean,
  IsEmail,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEmployeeInvitationDto {
  @IsEmail()
  email: string;

  @IsPositive()
  venue: number;
}

export class UpdateInvitationStatusDto {
  @IsString()
  @IsUUID()
  invitationId: string;

  @IsBoolean()
  verified: boolean;
}
