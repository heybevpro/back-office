import { Role } from '../../modules/role/entity/role.entity';

export interface VerifiedJwtPayload {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

export interface TemporaryAccessJwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}
