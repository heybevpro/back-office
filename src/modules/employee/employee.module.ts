import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from './service/employee.service';
import { RoleModule } from '../role/role.module';
import { Employee } from './entity/employee.entity';
import { EmployeeController } from './controller/employee.controller';
import { Cart } from '../cart/entity/cart.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Cart]),
    forwardRef(() => RoleModule),
  ],
  providers: [EmployeeService],
  exports: [EmployeeService],
  controllers: [EmployeeController],
})
export class EmployeeModule {}
