import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  validateSync,
} from 'class-validator';
import { EnvironmentType } from '../constants/environmentType';

class EnvironmentVariables {
  @IsEnum(EnvironmentType)
  @IsNotEmpty()
  NODE_ENV: EnvironmentType;

  @IsNumber()
  @IsPositive()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST: string;

  @IsNumber()
  @IsPositive()
  DATABASE_PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_USER: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_KEY: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;
}

export const validateEnvironment = (
  config: Record<string, unknown>,
): EnvironmentVariables => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) throw new Error(errors.toString());
  return validatedConfig;
};
