import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeService } from '../service/employee.service';
import { Employee } from '../entity/employee.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ImATeapotException,
  NotFoundException,
} from '@nestjs/common';
import { Venue } from '../../venue/entity/venue.entity';

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

describe('EmployeeService', () => {
  let service: EmployeeService;
  let repository: Repository<Employee>;
  let mockVenueRepository: { findByIds: jest.Mock };

  const mockVenue = { id: 1, name: 'Venue 1' };

  // function createQueryBuilderMock(
  //   result: any = undefined,
  // ): Partial<SelectQueryBuilder<Employee>> {
  //   return {
  //     leftJoin: jest.fn().mockReturnThis(),
  //     leftJoinAndSelect: jest.fn().mockReturnThis(),
  //     where: jest.fn().mockReturnThis(),
  //     andWhere: jest.fn().mockReturnThis(),
  //     getOne: jest.fn().mockResolvedValue(result),
  //     getMany: jest.fn().mockResolvedValue(Array.isArray(result) ? result : []),
  //   };
  // }

  beforeEach(async () => {
    mockVenueRepository = {
      findByIds: jest.fn().mockResolvedValue([mockVenue]),
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
          useValue: mockVenueRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    repository = module.get<Repository<Employee>>(getRepositoryToken(Employee));

    // jest
    //   .spyOn(repository, 'createQueryBuilder')
    //   .mockImplementation(() => createQueryBuilderMock() as any);
  });

  // it('should create an employee', async () => {
  //   jest.spyOn(repository, 'create').mockReturnValue(mockEmployee);
  //   jest.spyOn(repository, 'save').mockResolvedValue(mockEmployee);

  //   expect(await service.create(mockCreateDto)).toEqual(mockEmployee);

  //   expect(mockVenueRepository.findByIds).toHaveBeenCalledWith([1]);
  //   expect(repository.create).toHaveBeenCalledWith({
  //     ...mockCreateDto,
  //     venues: [mockVenue],
  //   });
  //   expect(repository.save).toHaveBeenCalledWith(mockEmployee);
  // });

  it('should return all employees', async () => {
    jest.spyOn(repository, 'find').mockResolvedValue([mockEmployee]);
    expect(await service.findAll()).toEqual([mockEmployee]);
  });

  it('should throw BadRequestException if creation fails', async () => {
    jest.spyOn(repository, 'create').mockReturnValue(mockEmployee);
    jest.spyOn(repository, 'save').mockRejectedValue(new ImATeapotException());

    await expect(service.create(mockCreateDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return an employee by id', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockEmployee);
    expect(await service.findById('uuid-1')).toEqual(mockEmployee);
  });

  it('should throw if employee not found', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);
    await expect(service.findById('not-exist')).rejects.toThrow(
      NotFoundException,
    );
  });
});
