import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProductTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  name: string;
}
