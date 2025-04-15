import { HttpException, HttpStatus } from '@nestjs/common';
import {
  InvalidCredentialsErrorResponse,
  InvalidJwtErrorResponse,
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

export class InvalidJwtException extends HttpException {
  constructor() {
    super(InvalidJwtErrorResponse, 498);
  }
}
