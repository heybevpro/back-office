import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationParameters } from '../../utils/constants/configuration.constants';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        configService.get(ConfigurationParameters.DATABASE)!,
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
