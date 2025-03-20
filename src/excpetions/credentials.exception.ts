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
  constructor() {
    super(UserNotFoundErrorResponse, HttpStatus.NOT_FOUND);
  }
}
