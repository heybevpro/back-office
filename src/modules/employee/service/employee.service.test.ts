import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeService } from '../service/employee.service';
import { Employee } from '../entity/employee.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import {
  BadRequestException,
  ImATeapotException,
  NotFoundException,
} from '@nestjs/common';
import { Venue } from '../../venue/entity/venue.entity';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let employeeRepository: Repository<Employee>;
  let venueRepository: Partial<Repository<Venue>>;

  const mockVenue = { id: 1, name: 'Venue 1' };

  const mockEmployee: Employee = {
    id: 'uuid-1',
    first_name: 'Jane',
    last_name: 'Smith',
    address_line1: '456 Side St',
    address_line2: undefined,
    city: 'Village',
    state: 'VS',
    zip: '67890',
    email: 'jane@example.com',
    phone: '+1987654321',
    venues: [],
    pin: '123456',
    employee_verified: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateDto = {
    first_name: 'Jane',
    last_name: 'Smith',
    address_line1: '456 Side St',
    address_line2: undefined,
    city: 'Village',
    state: 'VS',
    zip: '67890',
    email: 'jane@example.com',
    phone: '+1987654321',
    venues: [1],
    pin: '123456',
  };

  beforeEach(async () => {
    venueRepository = {
      findByIds: jest.fn().mockResolvedValue([mockVenue]),
      save: jest
        .fn()
        .mockImplementation((venue): Promise<Venue> => Promise.resolve(venue)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Venue),
          useValue: venueRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    employeeRepository = module.get<Repository<Employee>>(
      getRepositoryToken(Employee),
    );

    employeeRepository.createQueryBuilder = jest.fn().mockReturnValue({
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new employee', async () => {
      jest.spyOn(employeeRepository, 'create').mockReturnValue(mockEmployee);
      jest.spyOn(employeeRepository, 'save').mockResolvedValue(mockEmployee);

      const result = await service.create(mockCreateDto);

      expect(result).toEqual(mockEmployee);
      expect(venueRepository.findByIds).toHaveBeenCalledWith([1]);
      expect(employeeRepository.create).toHaveBeenCalledWith({
        first_name: 'Jane',
        last_name: 'Smith',
        address_line1: '456 Side St',
        address_line2: undefined,
        city: 'Village',
        state: 'VS',
        zip: '67890',
        email: 'jane@example.com',
        phone: '+1987654321',
        pin: '123456',
      });
      expect(employeeRepository.save).toHaveBeenCalledWith(mockEmployee);
    });

    it('should throw BadRequestException if saving fails', async () => {
      jest.spyOn(employeeRepository, 'create').mockReturnValue(mockEmployee);
      jest
        .spyOn(employeeRepository, 'save')
        .mockRejectedValue(new ImATeapotException());

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no venues are provided', async () => {
      const dtoWithoutVenues = { ...mockCreateDto, venues: [] };

      await expect(service.create(dtoWithoutVenues)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if some venue IDs are invalid', async () => {
      (venueRepository.findByIds as jest.Mock).mockResolvedValueOnce([]);

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if PIN already exists for venue', async () => {
      (venueRepository.findByIds as jest.Mock).mockResolvedValue([mockVenue]);

      (employeeRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockEmployee]),
      });

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException with fallback message on unexpected error', async () => {
      jest.spyOn(employeeRepository, 'create').mockImplementation(() => {
        throw new Error('Unexpected failure');
      });

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        'Unable to create employee',
      );
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
      jest.spyOn(employeeRepository, 'findOne').mockResolvedValue(mockEmployee);

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
