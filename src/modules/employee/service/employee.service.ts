import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Employee } from '../entity/employee.entity';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { EmployeeInvitation } from 'src/modules/employee-invitation/entity/employee-invitation.entity';
import { FailedToFetchEmployeesForVenueException } from '../../../exceptions/employee.exception';
import { AuthenticationService } from '../../authentication/service/authentication.service';
import { SuccessfulLoginResponse } from '../../../interfaces/api/response/api.response';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async create(
    createEmployeeDto: CreateEmployeeDto,
    invitation: EmployeeInvitation,
  ): Promise<Employee> {
    try {
      const employee = this.employeeRepository.create({
        ...createEmployeeDto,
        employee_invite: invitation,
        venue: { id: createEmployeeDto.venue },
      });
      return await this.employeeRepository.save(employee);
    } catch (err) {
      throw new BadRequestException(err, {
        cause: err,
      });
    }
  }

  async findAll(organizationId: number): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: { venue: { organization: { id: organizationId } } },
      relations: { venue: true },
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string): Promise<Employee> {
    try {
      return await this.employeeRepository.findOneOrFail({
        where: { id },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
        },
      });
    } catch (err) {
      throw new NotFoundException('Employee not found', { cause: err });
    }
  }

  async findByUserPin(pin: string): Promise<SuccessfulLoginResponse> {
    try {
      const employee = await this.employeeRepository.findOneByOrFail({ pin });
      return await this.authenticationService.generateJwtTokenResponseForEmployeeClockIn(
        employee.venue.organization.user.id,
      );
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Employee not found for the provided PIN');
      }
      throw error;
    }
  }

  async findAllEmployeeByVenue(venueId?: number): Promise<Employee[]> {
    try {
      return this.employeeRepository.find({
        where: {
          venue: { id: venueId },
        },
        relations: { venue: true },
        order: { created_at: 'DESC' },
      });
    } catch {
      throw new FailedToFetchEmployeesForVenueException();
    }
  }
}
