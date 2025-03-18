import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthenticationService } from '../service/authentication.service';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';
import {
  InvalidUserCredentialsException,
  UserNotFoundException,
} from '../../../excpetions/credentials.exception';
import { Strategy } from 'passport-local';

@Injectable()
export class CredentialsStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthenticationService) {
    super({ usernameField: 'email' });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<SuccessfulLoginResponse> {
    try {
      return await this.authService.validateUser({ email, password });
    } catch (error: unknown) {
      if (error instanceof UserNotFoundException) {
        throw new InvalidUserCredentialsException();
      }
      throw error;
    }
  }
}
