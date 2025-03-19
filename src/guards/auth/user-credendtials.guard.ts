import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UserCredentialsAuthGuard extends AuthGuard('local') {}
