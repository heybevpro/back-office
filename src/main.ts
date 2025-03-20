import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from './utils/constants/environmentType';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      disableErrorMessages: false, //TODO: Set to `true` in production
    }),
  );
  const configService: ConfigService = app.get<ConfigService>(ConfigService);
  await app.listen(
    configService.get<EnvironmentVariable.PORT>(EnvironmentVariable.PORT)!,
  );
}

bootstrap().catch((err: unknown) => {
  console.log(err);
  throw err;
});
