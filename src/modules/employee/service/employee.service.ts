import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Employee } from '../entity/employee.entity';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { Venue } from '../../venue/entity/venue.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    try {
      if (!dto.venues || dto.venues.length === 0) {
        throw new BadRequestException('At least one venue must be provided');
      }

      const venues = await this.venueRepository.findByIds(dto.venues);

      if (venues.length !== dto.venues.length) {
        throw new BadRequestException('Some venue IDs are invalid');
      }

      const existingEmployees = await this.employeeRepository
        .createQueryBuilder('employee')
        .leftJoin('employee.venues', 'venue')
        .where('employee.pin = :pin', { pin: dto.pin })
        .andWhere('venue.id IN (:...venueIds)', { venueIds: dto.venues })
        .getMany();

      if (existingEmployees.length > 0) {
        throw new BadRequestException(
          'PIN must be unique within selected venues',
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { venues: _, ...employeeData } = dto;
      const employee = this.employeeRepository.create(employeeData);
      await this.employeeRepository.save(employee);

      for (const venue of venues) {
        venue.employee = employee;
        await this.venueRepository.save(venue);
      }
      return employee;
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }

      throw new BadRequestException('Unable to create employee', {
        cause: err,
      });
    }
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find();
  }

  async findById(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
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
