import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Employee } from '../entity/employee.entity';
import { EmployeeService } from '../service/employee.service';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { EmployeeLoginRequestDto } from '../dto/employee-login-request.dto';

@UseGuards(JwtAuthGuard)
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  async findAll(): Promise<Employee[]> {
    return this.employeeService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Employee> {
    return this.employeeService.findById(id);
  }

  @Post('login')
  async login(@Body() loginDto: EmployeeLoginRequestDto): Promise<Employee> {
    return this.employeeService.findByUserPin(loginDto.pin);
  }

  @Get('venue/:venueId')
  async findAllEmployeeByVenue(
    @Param('venueId', new ParseIntPipe()) venueId: number,
  ): Promise<Employee[]> {
    return this.employeeService.findAllEmployeeByVenue(venueId);
  }
}
