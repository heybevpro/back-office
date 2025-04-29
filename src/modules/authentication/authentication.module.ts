import { Module } from '@nestjs/common';
import { AuthenticationService } from './service/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from '../../utils/constants/environmentType';
import { UserModule } from '../user/user.module';
import { AuthenticationController } from './controller/authentication.controller';
import { CredentialsStrategy } from './strategy/credentials/credentials.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt/jwt.strategy';
import { VerificationModule } from '../verification/verification.module';
import { TemporaryAccessStrategy } from './strategy/temporary-access/temporary-access.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get(EnvironmentVariable.JWT_SECRET),
        signOptions: { expiresIn: '5h' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    UserModule,
    PassportModule,
    VerificationModule,
  ],
  providers: [
    AuthenticationService,
    CredentialsStrategy,
    JwtStrategy,
    TemporaryAccessStrategy,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
