import { IsJSON, IsNotEmpty, IsString } from 'class-validator';

export class CreateTabDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsJSON()
  details: JSON;
}
