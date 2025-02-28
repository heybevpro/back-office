import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from './utils/constants/environmentType';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: ConfigService = app.get<ConfigService>(ConfigService);
  await app.listen(configService.get(EnvironmentVariable.PORT)!);
}

bootstrap().catch((err) => {
  console.log(err);
  throw err;
});
