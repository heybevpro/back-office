import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/service/user.service';

import * as bcrypt from 'bcrypt';
import {
  InvalidUserCredentialsException,
  UserNotFoundException,
} from '../../../excpetions/credentials.exception';
import { JwtService } from '@nestjs/jwt';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';
import { LoginRequestDto } from '../dto/login-request.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    loginRequestDto: LoginRequestDto,
  ): Promise<SuccessfulLoginResponse> {
    try {
      const user = await this.userService.findOneByEmail(loginRequestDto.email);
      const isPasswordMatched = await this.compareHash(
        loginRequestDto.password,
        user.password,
      );
      if (!isPasswordMatched) {
        throw new InvalidUserCredentialsException();
      }
      const sanitizedUserData = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        created_at: user.created_at,
      };
      return {
        access_token: await this.jwtService.signAsync({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        }),
        ...sanitizedUserData,
      };
    } catch (error: unknown) {
      if (error instanceof UserNotFoundException) {
        throw new InvalidUserCredentialsException();
      }
      throw error;
    }
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
