import { HttpStatus } from '@nestjs/common';

export const InvalidCredentialsErrorResponse = {
  message: 'Invalid credentials',
  status: HttpStatus.UNAUTHORIZED,
} as const;
