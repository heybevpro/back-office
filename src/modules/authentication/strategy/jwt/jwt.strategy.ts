import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from '../../../../utils/constants/environmentType';
import { AuthenticationService } from '../../service/authentication.service';
import { VerifiedJwtPayload } from '../../../../utils/constants/auth.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthenticationService,
  ) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<EnvironmentVariable.JWT_SECRET>(
        EnvironmentVariable.JWT_SECRET,
      )!,
    });
  }

  validate = async (payload: VerifiedJwtPayload) => {
    return await this.authService.validateUserJwt(payload);
  };
}
