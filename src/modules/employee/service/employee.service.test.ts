import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeService } from './employee.service';
import { Employee } from '../entity/employee.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import {
  BadRequestException,
  ImATeapotException,
  NotFoundException,
} from '@nestjs/common';
import { Venue } from '../../venue/entity/venue.entity';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { EmployeeInvitation } from '../../employee-invitation/entity/employee-invitation.entity';
import { EmployeeInvitationStatus } from '../../../utils/constants/employee.constants';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let employeeRepository: Repository<Employee>;

  const mockCreateDto: CreateEmployeeDto = {
    first_name: 'Jane',
    last_name: 'Smith',
    address_line1: '456 Side St',
    city: 'Village',
    state: 'VS',
    zip: '67890',
    email: 'jane@example.com',
    phone: '+14155552671',
    venue: 1,
    pin: '123456',
    document: 'https://example.com/test.pdf',
  };

  const mockInvitation: EmployeeInvitation = {
    id: '1',
    email: 'jane@example.com',
    pin: '123456',
    status: EmployeeInvitationStatus.Onboarding,
    venue: { id: 1 } as Venue,
    created_at: new Date(),
    updated_at: new Date(),
  };

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
    venue: {} as Venue,
    pin: '123456',
    employee_verified: false,
    employee_invite: mockInvitation,
    document: 'https://example.com/test.pdf',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Venue),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    employeeRepository = module.get<Repository<Employee>>(
      getRepositoryToken(Employee),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new employee', async () => {
      jest.spyOn(employeeRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(employeeRepository, 'create').mockReturnValue(mockEmployee);
      jest.spyOn(employeeRepository, 'save').mockResolvedValue(mockEmployee);

      expect(await service.create(mockCreateDto, mockInvitation)).toEqual(
        mockEmployee,
      );
    });

    it('should throw a BadRequestException if the Query fails', async () => {
      jest.spyOn(employeeRepository, 'create').mockReturnValue(mockEmployee);
      jest
        .spyOn(employeeRepository, 'save')
        .mockRejectedValue(new ImATeapotException());

      await expect(
        service.create(mockCreateDto, mockInvitation),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all employees', async () => {
      jest.spyOn(employeeRepository, 'find').mockResolvedValue([mockEmployee]);
      const result = await service.findAll(1);
      expect(result).toEqual([mockEmployee]);
    });
  });

  describe('findById', () => {
    it('should return the employee by id if found', async () => {
      jest
        .spyOn(employeeRepository, 'findOneOrFail')
        .mockResolvedValue(mockEmployee);

      const result = await service.findById('uuid-1');
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException if employee not found', async () => {
      jest.spyOn(employeeRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUserPin', () => {
    it('should return employee for valid pin', async () => {
      jest
        .spyOn(employeeRepository, 'findOneByOrFail')
        .mockResolvedValue(mockEmployee);

      const result = await service.findByUserPin('123456');
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException if pin not found', async () => {
      jest
        .spyOn(employeeRepository, 'findOneByOrFail')
        .mockRejectedValue(
          new EntityNotFoundError(Employee, { pin: '999999' }),
        );

      await expect(service.findByUserPin('999999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should rethrow unknown errors from findByUserPin', async () => {
      jest
        .spyOn(employeeRepository, 'findOneByOrFail')
        .mockRejectedValue(new Error('Database crash'));

      await expect(service.findByUserPin('123456')).rejects.toThrow(
        'Database crash',
      );
    });
  });

  describe('CreateEmployeeDto', () => {
    it('should fail validation if required fields are missing', async () => {
      const invalidDto = plainToInstance(CreateEmployeeDto, {});
      const errors = await validate(invalidDto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.map((e) => e.property)).toContain('first_name');
    });

    it('should pass validation with all valid fields', async () => {
      const validDto = plainToInstance(CreateEmployeeDto, mockCreateDto);

      const errors = await validate(validDto);
      expect(errors.length).toBe(0);
    });
  });

  describe('findEmployeeByVenueId', () => {
    it('should return employye list employees match criteria', async () => {
      jest.spyOn(employeeRepository, 'find').mockResolvedValue([mockEmployee]);

      const result = await service.findAllEmployeeByVenue(1);
      expect(result).toEqual([mockEmployee]);
    });
  });
});
