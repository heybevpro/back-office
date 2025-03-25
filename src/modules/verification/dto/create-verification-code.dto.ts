import { IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateVerificationCodeDto {
  @IsPhoneNumber('US')
  phone_number: string;

  @IsOptional()
  expires_at: Date;
}
