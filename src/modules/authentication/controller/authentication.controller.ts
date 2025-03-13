import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { AuthenticationService } from '../service/authentication.service';
import { LoginRequestDto } from '../dto/login-request.dto';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';
import { User } from '../../user/entity/user.entity';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { DatabaseClientExceptionFilter } from '../../../filters/database-client-expection.filter';

@Controller('auth')
@UseFilters(DatabaseClientExceptionFilter)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() logInRequestDto: LoginRequestDto,
  ): Promise<SuccessfulLoginResponse> {
    return this.authenticationService.validateUser(logInRequestDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authenticationService.register(createUserDto);
  }
}
