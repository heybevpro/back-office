import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from '../service/authentication.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { DatabaseClientExceptionFilter } from '../../../filters/database-client-expection.filter';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';
import { LoginRequestValidationGuard } from '../../../guards/forms/authentication/login-request-validation.guard';
import { LoginRequestDto } from '../dto/login-request.dto';
import { UserCredentialsAuthGuard } from '../../../guards/auth/user-credendtials.guard';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { User } from '../../user/entity/user.entity';
import { RequestPasswordResetDto } from '../dto/request-password-reset.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ValidatePasswordResetDTO } from '../dto/validate-password-reset.dto';
import { TemporaryJwtGuard } from '../../../guards/auth/temporary-jwt.guard';
import { AccountOnboardingDto } from '../dto/account-onboarding.dto';

@Controller('auth')
@UseFilters(DatabaseClientExceptionFilter)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<SuccessfulLoginResponse> {
    return this.authenticationService.register(createUserDto);
  }

  @UseGuards(LoginRequestValidationGuard, UserCredentialsAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Request() request: { user: LoginRequestDto },
  ): Promise<SuccessfulLoginResponse> {
    return request.user as unknown as Promise<SuccessfulLoginResponse>;
  }

  @UseGuards(JwtAuthGuard)
  @Get('logged-in-user')
  loggedInUserDetails(@Request() request: { user: User }): User {
    return request.user;
  }

  @Post('request-password-reset')
  requestResetPassword(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    return this.authenticationService.requestResetPassword(
      requestPasswordResetDto.email,
    );
  }

  @Post('validate-reset-password')
  validateResetPassword(
    @Body() validateResetPasswordDto: ValidatePasswordResetDTO,
  ) {
    return this.authenticationService.validateResetPassword(
      validateResetPasswordDto.rs,
    );
  }

  @UseGuards(TemporaryJwtGuard)
  @Post('reset-password')
  resetPassword(
    @Request() request: { user: { id: string } },
    @Body() requestPasswordResetDto: ResetPasswordDto,
  ) {
    return this.authenticationService.resetPassword(
      request.user.id,
      requestPasswordResetDto.updated_password,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('onboard')
  onboard(
    @Request() request: { user: { id: string } },
    @Body() onboardingDto: AccountOnboardingDto,
  ) {
    return this.authenticationService.onboard(request.user.id, onboardingDto);
  }
}
