export interface VerifiedJwtPayload {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
