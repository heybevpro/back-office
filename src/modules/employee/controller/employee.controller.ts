import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Employee } from '../entity/employee.entity';
import { EmployeeService } from '../service/employee.service';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { EmployeeLoginRequestDto } from '../dto/employee-login-request.dto';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Request() request: { user: { organization: { id: number } } },
  ): Promise<Employee[]> {
    return this.employeeService.findAll(request.user.organization.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Employee> {
    return this.employeeService.findById(id);
  }

  @Post('login')
  async login(
    @Body() loginDto: EmployeeLoginRequestDto,
  ): Promise<SuccessfulLoginResponse> {
    return this.employeeService.findByUserPin(loginDto.pin);
  }

  @UseGuards(JwtAuthGuard)
  @Get('venue/:venueId')
  async findAllEmployeeByVenue(
    @Param('venueId', new ParseIntPipe()) venueId: number,
  ): Promise<Employee[]> {
    return this.employeeService.findAllEmployeeByVenue(venueId);
  }
}
