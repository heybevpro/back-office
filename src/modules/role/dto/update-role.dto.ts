import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../../utils/constants/role.constants';

export class UpdateRoleDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsEnum(Role)
  role: Role;
}
