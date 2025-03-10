import { Module } from '@nestjs/common';
import { UserService } from '../user/service/user.service';
import { AuthenticationService } from './service/authentication.service';

@Module({
  providers: [AuthenticationService, UserService],
  controllers: [],
})
export class AuthenticationModule {}
