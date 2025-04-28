import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './utils/validations/environment.validation';
import databaseConfiguration from './config/database/database.configuration';
import { DatabaseModule } from './config/database/database.module';
import applicationConfiguration from './config/application.configuration';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { UserModule } from './modules/user/user.module';
import { VerificationModule } from './modules/verification/verification.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { VenueModule } from './modules/venue/venue.module';
import { ProductTypeModule } from './modules/product-type/product-type.module';
import { ProductModule } from './modules/product/product.module';
import { VoiceModule } from './modules/voice/voice.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfiguration, applicationConfiguration],
      validate: validateEnvironment,
    }),
    DatabaseModule,
    AuthenticationModule,
    UserModule,
    VerificationModule,
    InvitationModule,
    OrganizationModule,
    VenueModule,
    ProductTypeModule,
    ProductModule,
    VoiceModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
