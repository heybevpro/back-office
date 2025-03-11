import { Module } from '@nestjs/common';
import { AuthenticationService } from './service/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from '../../utils/constants/environmentType';
import { UserModule } from '../user/user.module';
import { AuthenticationController } from './controller/authentication.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get(EnvironmentVariable.JWT_SECRET),
          signOptions: { expiresIn: '60s' },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
