import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from '../service/authentication.service';
import { LoginRequestDto } from '../dto/login-request.dto';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('login')
  async login(
    @Body() logInRequestDto: LoginRequestDto,
  ): Promise<SuccessfulLoginResponse> {
    return this.authenticationService.signIn(logInRequestDto);
  }
}
