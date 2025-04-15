import { HttpStatus } from '@nestjs/common';

export const InvalidCredentialsErrorResponse = {
  message: 'Invalid credentials',
  status: HttpStatus.UNAUTHORIZED,
} as const;

export const UserNotFoundErrorResponse = {
  message: 'User not found',
  status: HttpStatus.NOT_FOUND,
} as const;

export const VerificationMessageSentSuccessResponse = {
  message: 'Verification Message Sent',
  status: HttpStatus.CREATED,
} as const;

export const VerificationMSuccessfulResponse = {
  message: 'Phone Number Verified',
  status: HttpStatus.OK,
} as const;

export const InvalidJwtErrorResponse = {
  message: 'Invalid JWT',
  status: 498,
};
