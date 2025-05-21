import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateDeviceDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  venue: number;
}
