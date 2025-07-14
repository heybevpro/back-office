import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTabDto {
  @IsNotEmpty()
  @IsString()
  details: string;
}
