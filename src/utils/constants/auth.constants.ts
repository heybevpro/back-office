import { Role } from '../../modules/role/entity/role.entity';
import { Request } from '@nestjs/common';

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

export interface AuthorizedRequest extends Request {
  user: {
    id: string;
    email: string;
    first_name: string;
    organization: {
      id: number;
      name: string;
    };
    role: {
      id: string;
      name: string;
    };
  };
}
