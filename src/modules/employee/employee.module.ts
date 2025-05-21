import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from './service/employee.service';
import { RoleModule } from '../role/role.module';
import { Employee } from './entity/employee.entity';
import { EmployeeController } from './controller/employee.controller';
import { Venue } from '../venue/entity/venue.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Venue]),
    forwardRef(() => RoleModule),
  ],
  providers: [EmployeeService],
  exports: [EmployeeService],
  controllers: [EmployeeController],
})
export class EmployeeModule {}
