import { IsPhoneNumber } from 'class-validator';

export class CreateInvitationDto {
  @IsPhoneNumber()
  phone_number: string;
}
