import { IsNotEmpty, IsString } from 'class-validator';

export class ValidatePasswordResetDTO {
  @IsString()
  @IsNotEmpty()
  rs: string;
}
