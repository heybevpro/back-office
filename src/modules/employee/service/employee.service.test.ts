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
    phone: '+1987654321',
    venue: 1,
    pin: '123456',
    document: '/test',
  };

  const mockInvitation = {
    id: '1',
    code: 'INV123',
    email: 'jane@example.com',
    pin: '123456',
    status: EmployeeInvitationStatus.Onboarding,
    organization: { id: 1 },
    venue: { id: 1 } as Venue,
    created_at: new Date(),
    updated_at: new Date(),
  } as EmployeeInvitation;

  const mockEmployee = {
    id: 1,
    ...mockCreateDto,
    venue: { id: 1 },
    employee_invite: mockInvitation,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Employee;

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
      const result = await service.findAll();
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
});
