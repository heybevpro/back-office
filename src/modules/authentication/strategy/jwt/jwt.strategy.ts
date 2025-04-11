import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from '../../../../utils/constants/environmentType';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<EnvironmentVariable.JWT_SECRET>(
        EnvironmentVariable.JWT_SECRET,
      )!,
    });
  }

  validate = <T>(payload: T): T => {
    return payload;
  };
}
