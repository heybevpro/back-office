import { HttpException, HttpStatus } from '@nestjs/common';
import { InvalidCredentialsErrorResponse } from '../utils/constants/api-response.constants';

export class InvalidUserCredentialsException extends HttpException {
  constructor() {
    super(InvalidCredentialsErrorResponse, HttpStatus.UNAUTHORIZED);
  }
}
