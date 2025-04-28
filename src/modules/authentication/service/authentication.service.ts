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
import { VerificationService } from '../../verification/service/verification.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class AuthenticationService {
  private static readonly SALT_ROUNDS = 13;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly verificationService: VerificationService,
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
      email_verified: user.email_verified,
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
        verifiedJwtPayload.role.role_name,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      throw new InvalidUserCredentialsException();
    }
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<SuccessfulLoginResponse> {
    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      AuthenticationService.SALT_ROUNDS,
    );
    const user = await this.userService.create(createUserDto);
    await this.verificationService.addEmailVerificationRecord({
      email: user.email,
    });

    return {
      access_token: await this.jwtService.signAsync(instanceToPlain(user)),
      ...user,
    };
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
