import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/service/user.service';

import * as bcrypt from 'bcrypt';
import { InvalidUserCredentialsException } from '../../../excpetions/credentials.exception';
import { JwtService } from '@nestjs/jwt';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';
import { LoginRequestDto } from '../dto/login-request.dto';
import { User } from '../../user/entity/user.entity';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { VerifiedJwtPayload } from '../../../utils/constants/auth.constants';
import { Role } from '../../../utils/constants/role.constants';

@Injectable()
export class AuthenticationService {
  private static readonly SALT_ROUNDS = 13;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    loginRequestDto: LoginRequestDto,
  ): Promise<SuccessfulLoginResponse> {
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
      role: user.role.role_name,
      created_at: user.created_at,
    };
    return {
      access_token: await this.jwtService.signAsync(sanitizedUserData),
      ...sanitizedUserData,
    };
  }

  async validateUserJwt(verifiedJwtPayload: VerifiedJwtPayload): Promise<User> {
    try {
      return await this.userService.findOneByIdAndRole(
        verifiedJwtPayload.id,
        verifiedJwtPayload.role as Role,
      );
    } catch (error) {
      console.log(error);
      throw new InvalidUserCredentialsException();
    }
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      AuthenticationService.SALT_ROUNDS,
    );
    return await this.userService.create(createUserDto);
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
