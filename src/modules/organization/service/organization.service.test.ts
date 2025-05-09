import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from '../entity/organization.entity';
import { Repository } from 'typeorm';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { User } from '../../user/entity/user.entity';
import { OrganizationSize } from '../../../utils/constants/organization.constants';
import { BadRequestException } from '@nestjs/common';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let organizationRepository: Repository<Organization>;

  const mockOrganization: Organization = {
    id: 1,
    name: '<_VALID-ORG-NAME_>',
    created_at: new Date(),
    updated_at: new Date(),
    venues: [],
    user: {} as User,
    address_line1: '123 Main St',
    address_line2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    size: OrganizationSize.SMALL,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Organization),
          useClass: Repository,
        },
        OrganizationService,
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    organizationRepository = module.get<Repository<Organization>>(
      getRepositoryToken(Organization),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return an `Organization`', async () => {
      const createOrganizationPayload: CreateOrganizationDto = {
        name: '<_VALID-ORG-NAME_>',
        phone: '123-456-7890',
        address_line1: '123 Main St',
        address_line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        size: OrganizationSize.SMALL,
      };
      const createOrganizationSpy = jest.spyOn(
        organizationRepository,
        'create',
      );
      const saveOrganizationSpy = jest.spyOn(organizationRepository, 'save');
      createOrganizationSpy.mockReturnValue(mockOrganization);
      saveOrganizationSpy.mockResolvedValue(mockOrganization);
      expect(await service.create(createOrganizationPayload)).toEqual(
        mockOrganization,
      );
    });

    it('should throw a BadRequestException if Create Query fails', async () => {
      const createOrganizationPayload: CreateOrganizationDto = {
        name: '<_VALID-ORG-NAME_>',
        phone: '123-456-7890',
        address_line1: '123 Main St',
        address_line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        size: OrganizationSize.SMALL,
      };
      const createOrganizationSpy = jest.spyOn(
        organizationRepository,
        'create',
      );
      const saveOrganizationSpy = jest.spyOn(organizationRepository, 'save');
      createOrganizationSpy.mockReturnValue(mockOrganization);
      saveOrganizationSpy.mockRejectedValue(new Error('Failed to save'));
      await expect(service.create(createOrganizationPayload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all organizations', async () => {
      const findAllOrganizationSpy = jest.spyOn(organizationRepository, 'find');
      findAllOrganizationSpy.mockResolvedValue([mockOrganization]);

      expect(await service.findAll()).toEqual([mockOrganization]);
    });
  });
});
