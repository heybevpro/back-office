import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from '../service/authentication.service';
import { User } from '../../user/entity/user.entity';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { DatabaseClientExceptionFilter } from '../../../filters/database-client-expection.filter';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';
import { LoginRequestValidationGuard } from '../../../guards/forms/authentication/login-request-validation.guard';
import { LoginRequestDto } from '../dto/login-request.dto';
import { UserCredentialsAuthGuard } from '../../../guards/auth/user-credendtials.guard';

@Controller('auth')
@UseFilters(DatabaseClientExceptionFilter)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
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
}
