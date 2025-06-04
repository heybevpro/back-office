import { IsEmail, IsPositive } from 'class-validator';

export class CreateEmployeeInvitationDto {
  @IsEmail()
  email: string;

  @IsPositive()
  venue: number;
}
