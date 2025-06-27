import { Test, TestingModule } from '@nestjs/testing';
import { ServingSizeService } from './serving-size.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServingSize } from '../entity/serving-size.entity';
import { OrganizationService } from '../../organization/service/organization.service';
import { CreateServingSizeDto } from '../dto/create-serving-size.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Organization } from '../../organization/entity/organization.entity';

const mockOrganization = { id: 1, name: 'Org 1' } as Organization;

const mockOrganizationService = {
  findOneById: jest.fn(),
};

describe('ServingSizeService', () => {
  let service: ServingSizeService;
  let repository: Repository<ServingSize>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServingSizeService,
        {
          provide: getRepositoryToken(ServingSize),
          useClass: Repository,
        },
        {
          provide: OrganizationService,
          useValue: mockOrganizationService,
        },
      ],
    }).compile();

    service = module.get<ServingSizeService>(ServingSizeService);
    repository = module.get<Repository<ServingSize>>(
      getRepositoryToken(ServingSize),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if organization is not found', async () => {
      mockOrganizationService.findOneById.mockResolvedValue(null);

      await expect(
        service.create({ label: 'Small', volume_in_ml: 150, organization: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create and return a serving size', async () => {
      const dto: CreateServingSizeDto = {
        label: 'Medium',
        volume_in_ml: 250,
        organization: 1,
      };

      const mockServingSize = {
        id: 'uuid',
        label: dto.label,
        volume_in_ml: dto.volume_in_ml,
        organization: mockOrganization,
      } as ServingSize;

      mockOrganizationService.findOneById.mockResolvedValue(mockOrganization);
      jest.spyOn(repository, 'create').mockReturnValue(mockServingSize);
      jest.spyOn(repository, 'save').mockResolvedValue(mockServingSize);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        label: dto.label,
        volume_in_ml: dto.volume_in_ml,
        organization: mockOrganization,
      });
      expect(result).toEqual(mockServingSize);
    });

    it('should throw an error if label is not unique within the organization', async () => {
      const dto: CreateServingSizeDto = {
        label: 'Medium',
        volume_in_ml: 250,
        organization: 1,
      };

      const mockServingSize = {
        id: 'uuid',
        label: dto.label,
        volume_in_ml: dto.volume_in_ml,
        organization: mockOrganization,
      } as ServingSize;

      mockOrganizationService.findOneById.mockResolvedValue(mockOrganization);
      jest.spyOn(repository, 'create').mockReturnValue(mockServingSize);
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue(new BadRequestException('Duplicate label'));

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllByOrganization', () => {
    it('should return all serving sizes for an organization', async () => {
      const mockServingSizes = [
        {
          id: 'uuid-1',
          label: 'S',
          volume_in_ml: 100,
          organization: mockOrganization,
        },
        {
          id: 'uuid-2',
          label: 'L',
          volume_in_ml: 300,
          organization: mockOrganization,
        },
      ] as ServingSize[];

      jest.spyOn(repository, 'find').mockResolvedValue(mockServingSizes);

      const result = await service.findAllByOrganization(1);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['organization'],
        where: { organization: { id: 1 } },
        order: {
          created_at: 'DESC',
        },
      });
      expect(result).toEqual(mockServingSizes);
    });
  });

  describe('findOneById', () => {
    it('should return a serving size by ID', async () => {
      const mockServingSize = {
        id: 'uuid-1',
        label: 'XL',
        volume_in_ml: 400,
        organization: mockOrganization,
      } as ServingSize;

      jest
        .spyOn(repository, 'findOneOrFail')
        .mockResolvedValue(mockServingSize);

      const result = await service.findOneById('uuid-1');
      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        relations: ['organization'],
      });
      expect(result).toEqual(mockServingSize);
    });
  });
});
