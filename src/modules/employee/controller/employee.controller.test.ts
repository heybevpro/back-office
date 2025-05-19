import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from '../controller/employee.controller';
import { EmployeeService } from '../service/employee.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { Employee } from '../entity/employee.entity';

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let service: jest.Mocked<EmployeeService>;

  const mockEmployee: Employee = {
    id: 'uuid-1',
    first_name: 'John',
    last_name: 'Doe',
    address_line1: '123 Main St',
    address_line2: 'Apt 4',
    city: 'Townsville',
    state: 'TS',
    zip: '12345',
    email: 'john@example.com',
    phone: '+1234567890',
    venues: [],
    pin: '123456',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockEmployeeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
    service = module.get(EmployeeService);
  });

  it('should create an employee', async () => {
    const dto = {
      ...mockEmployee,
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
    } as unknown as CreateEmployeeDto;

    service.create.mockResolvedValue(mockEmployee);
    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockEmployee);
  });

  it('should return all employees', async () => {
    service.findAll.mockResolvedValue([mockEmployee]);
    expect(await controller.findAll()).toEqual([mockEmployee]);
  });

  it('should return employee by id', async () => {
    service.findById.mockResolvedValue(mockEmployee);
    expect(await controller.findById('uuid-1')).toEqual(mockEmployee);
  });
});
