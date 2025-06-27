import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
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

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  pin: string;

  @IsPositive()
  venue: number;
}
