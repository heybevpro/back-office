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
import { FailedToFetchEmployeesForVenueException } from '../../../excpetions/employee.exception';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
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

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
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

  async findByUserPin(pin: string): Promise<Employee> {
    try {
      return await this.employeeRepository.findOneByOrFail({ pin });
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
  async findAllByOrganization(organizationId: number): Promise<Employee[]> {
    return await this.employeeRepository.find({
      relations: ['venue', 'venue.organization'],
      where: {
        venue: {
          organization: {
            id: organizationId,
          },
        },
      },
      order: { created_at: 'DESC' },
    });
  }
}
