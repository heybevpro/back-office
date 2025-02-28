import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './utils/validations/environment.validation';
import databaseConfiguration from './config/database/database.configuration';
import { DatabaseModule } from './config/database/database.module';
import applicationConfiguration from './config/application.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfiguration, applicationConfiguration],
      validate: validateEnvironment,
    }),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
