import { HttpStatus } from '@nestjs/common';

export const InvalidCredentialsErrorResponse = {
  message: 'Invalid credentials',
  status: HttpStatus.UNAUTHORIZED,
} as const;

export const UserNotFoundErrorResponse = {
  message: 'User not found',
  status: HttpStatus.NOT_FOUND,
} as const;
