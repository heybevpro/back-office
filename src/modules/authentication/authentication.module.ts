import { Module } from '@nestjs/common';
import { AuthenticationService } from './service/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from '../../utils/constants/environmentType';
import { UserModule } from '../user/user.module';
import { AuthenticationController } from './controller/authentication.controller';
import { CredentialsStrategy } from './strategy/credentials.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get(EnvironmentVariable.JWT_SECRET),
        signOptions: { expiresIn: '60s' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [AuthenticationService, CredentialsStrategy],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
