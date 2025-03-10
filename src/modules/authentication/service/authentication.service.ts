import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/entity/user.entity';

import * as bcrypt from 'bcrypt';
import { InvalidUserCredentialsException } from '../../../excpetions/credentials.exception';

@Injectable()
export class AuthenticationService {
  constructor(private readonly userService: UserService) {}

  async signIn(email: string, password: string): Promise<User> {
    try {
      const user = await this.userService.findOneByEmail(email);
      const isPasswordMatched = await this.compareHash(password, user.password);
      if (!isPasswordMatched) {
        throw new InvalidUserCredentialsException();
      }
      return user;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw new InvalidUserCredentialsException();
      }
      throw error;
    }
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
