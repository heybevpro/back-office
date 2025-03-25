import { IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyPhoneDto {
  @IsPhoneNumber('US')
  phone_number: string;

  @IsString()
  @Length(6)
  verification_code: string;
}
