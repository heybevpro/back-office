import { IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @MaxLength(6)
  @MinLength(6)
  verification_code: string;
}
