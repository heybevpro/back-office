import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityNotFoundError, Repository } from 'typeorm';
import { Employee } from '../entity/employee.entity';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { Cart } from '../../cart/entity/cart.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    try {
      return this.dataSource.transaction(async (manager) => {
        const employee = manager.create(Employee, {
          ...createEmployeeDto,
          venue: { id: createEmployeeDto.venue },
        });
        const savedEmployee = await manager.save(employee);

        const cart = manager.create(Cart, { employee: savedEmployee });
        await manager.save(cart);

        return savedEmployee;
      });
    } catch (err) {
      throw new BadRequestException('Failed to create employee and cart', {
        cause: err,
      });
    }
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find();
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
