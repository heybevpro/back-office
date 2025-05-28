import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entity/cart.entity';
import { CartService } from './service/cart.service';
import { CartController } from './controller/cart.controller';
import { RoleModule } from '../role/role.module';
import { OrganizationModule } from '../organization/organization.module';
import { Employee } from '../employee/entity/employee.entity';
import { CartContent } from '../cart-content/entity/cart-content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, Employee, CartContent]),
    forwardRef(() => RoleModule),
    OrganizationModule,
  ],
  providers: [CartService],
  exports: [CartService],
  controllers: [CartController],
})
export class CartModule {}
