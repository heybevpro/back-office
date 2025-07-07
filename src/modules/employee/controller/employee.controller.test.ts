import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from '../service/employee.service';
import { Employee } from '../entity/employee.entity';
import { NotFoundException } from '@nestjs/common';
import { Venue } from '../../venue/entity/venue.entity';
import { EmployeeInvitation } from '../../employee-invitation/entity/employee-invitation.entity';

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
    venue: { id: 1 } as Venue,
    pin: '123456',
    employee_verified: false,
    employee_invite: {} as EmployeeInvitation,
    document: '/test',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockEmployeeService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserPin: jest.fn(),
    findAllEmployeeByVenue: jest.fn(),
    findAllByOrganization: jest.fn(),
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find all employees', () => {
    it('should return all employees', async () => {
      service.findAll.mockResolvedValue([mockEmployee]);
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockEmployee]);
    });
  });

  describe('find employee by id', () => {
    it('should return employee by id', async () => {
      service.findById.mockResolvedValue(mockEmployee);
      const result = await controller.findById('uuid-1');

      expect(service.findById).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(mockEmployee);
    });
  });

  describe('login', () => {
    it('should return employee if pin is correct', async () => {
      const loginDto = { pin: '123456' };
      service.findByUserPin.mockResolvedValue(mockEmployee);

      const result = await controller.login(loginDto);

      expect(service.findByUserPin).toHaveBeenCalledWith('123456');
      expect(result).toEqual(mockEmployee);
    });

    it('should return null if pin is invalid', async () => {
      service.findByUserPin.mockRejectedValue(
        new NotFoundException('Employee not found'),
      );

      await expect(controller.login({ pin: 'wrong pin' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('find registered employee by venue id', () => {
    it('should return  employee list', async () => {
      service.findAllEmployeeByVenue.mockResolvedValue([mockEmployee]);
      const result = await controller.findAllEmployeeByVenue(1);
      expect(service.findAllEmployeeByVenue).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockEmployee]);
    });
  });

  describe('find all employees by organization', () => {
    it('should return all employees by organization', async () => {
      service.findAllByOrganization.mockResolvedValue([mockEmployee]);
      const result = await controller.findAllByOrganization(1);
      expect(service.findAllByOrganization).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockEmployee]);
    });
  });
});
