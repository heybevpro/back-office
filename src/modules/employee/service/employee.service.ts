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
    const { pin, venue: venueId, email } = createEmployeeDto;

    try {
      const existingEmail = await this.employeeRepository.findOne({
        where: { email },
      });

      if (existingEmail) {
        throw new BadRequestException(
          `An employee with email ${email} is already registered.`,
        );
      }

      const existingPinForVenue = await this.employeeRepository.findOne({
        where: {
          pin,
          venue: { id: venueId },
        },
        relations: { venue: true },
      });

      if (existingPinForVenue) {
        throw new BadRequestException(
          `An employee with pin ${pin} is already registered for this venue.`,
        );
      }

      const employee = this.employeeRepository.create({
        ...createEmployeeDto,
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
