import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { LoginRequestDto } from '../../../modules/authentication/dto/login-request.dto';
import { validate } from 'class-validator';

@Injectable()
export class LoginRequestValidationGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const loginRequestDto = plainToInstance(LoginRequestDto, request.body);
    const errors = await validate(loginRequestDto);

    if (errors.length) {
      throw new BadRequestException(errors);
    }

    return true;
  }
}
