import { IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'PIN must be a 6-digit number' })
  pin: string;
}
