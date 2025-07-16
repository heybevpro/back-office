import { HttpException, HttpStatus } from '@nestjs/common';
import {
  InvalidCredentialsErrorResponse,
  UserNotFoundErrorResponse,
} from '../utils/constants/api-response.constants';

export class InvalidUserCredentialsException extends HttpException {
  constructor() {
    super(InvalidCredentialsErrorResponse, HttpStatus.UNAUTHORIZED);
  }
}

export class UserNotFoundException extends HttpException {
  constructor(description?: string) {
    super(UserNotFoundErrorResponse, HttpStatus.NOT_FOUND, { description });
  }
}

export class FailedToSendEmailException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'Failed to send email',
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

export class PasswordUpdateException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Password does not match. Please try again.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
