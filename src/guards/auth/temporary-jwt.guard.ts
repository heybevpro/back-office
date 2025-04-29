import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TemporaryJwtGuard extends AuthGuard('jwt') {}
