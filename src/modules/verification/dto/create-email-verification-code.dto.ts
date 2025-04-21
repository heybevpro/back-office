import { IsEmail } from 'class-validator';

export class CreateEmailVerificationCodeDto {
  @IsEmail()
  email: string;
}
