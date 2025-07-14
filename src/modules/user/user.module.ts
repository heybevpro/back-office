import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { RoleModule } from '../role/role.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RoleModule, OrganizationModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
