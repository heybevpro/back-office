import {
  ConfigurationParameters,
  DATABASE_TYPE,
} from '../../utils/constants/configuration.constants';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService, registerAs } from '@nestjs/config';

const entitiesPath = [__dirname + '/../../**/entities/*.entity{.ts,.js}'];
const migrationsPath = [__dirname + '/../../**/migrations/*{.ts,.js}'];

const configService = new ConfigService();

export default registerAs(
  ConfigurationParameters.DATABASE,
  (): TypeOrmModuleOptions => ({
    host: configService.get<string>('DATABASE_HOST'),
    port: +configService.get<string>('DATABASE_PORT')!,
    type: DATABASE_TYPE,
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_KEY'),
    database: configService.get<string>('DATABASE_NAME'),
    entities: entitiesPath,
    synchronize: false,
    migrations: migrationsPath,
    migrationsRun: true,
    logging: false,
  }),
);
//
