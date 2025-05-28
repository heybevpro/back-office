import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Employee } from '../entity/employee.entity';
import { CreateEmployeeDto } from '../dto/create-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const { pin, venue: venueId } = createEmployeeDto;

    try {
      const existing = await this.employeeRepository.findOne({
        where: {
          pin,
          venue: { id: venueId },
        },
      });

      if (existing) {
        throw new BadRequestException(
          `An employee with pin '${pin}' already exists in venue '${venueId}'`,
        );
      }

      const employee = this.employeeRepository.create({
        ...createEmployeeDto,
        venue: { id: createEmployeeDto.venue },
      });
      return await this.employeeRepository.save(employee);
    } catch (err) {
      throw new BadRequestException('Failed to create employee', {
        cause: err,
      });
    }
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      relations: ['venue'],
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
}
