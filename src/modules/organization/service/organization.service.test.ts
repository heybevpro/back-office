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

  describe('findOne', () => {
    it('should return an organization by name', async () => {
      const orgName = '<_VALID-ORG-NAME_>';
      const findOneSpy = jest
        .spyOn(organizationRepository, 'findOne')
        .mockResolvedValue(mockOrganization);

      const result = await service.findOne(orgName);
      expect(findOneSpy).toHaveBeenCalledWith({ where: { name: orgName } });
      expect(result).toEqual(mockOrganization);
    });

    it('should return null if organization not found', async () => {
      const orgName = '<_NON-EXISTENT-ORG_>';
      const findOneSpy = jest
        .spyOn(organizationRepository, 'findOne')
        .mockResolvedValue(null);

      const result = await service.findOne(orgName);
      expect(findOneSpy).toHaveBeenCalledWith({ where: { name: orgName } });
      expect(result).toBeNull();
    });
  });

  describe('findOneById', () => {
    it('should return an organization by id', async () => {
      const orgId = 1;
      const findOneOrFailSpy = jest
        .spyOn(organizationRepository, 'findOneOrFail')
        .mockResolvedValue(mockOrganization);

      const result = await service.findOneById(orgId);
      expect(findOneOrFailSpy).toHaveBeenCalledWith({ where: { id: orgId } });
      expect(result).toEqual(mockOrganization);
    });

    it('should throw if organization not found', async () => {
      const orgId = 999;
      const error = new Error('Not found');
      jest
        .spyOn(organizationRepository, 'findOneOrFail')
        .mockRejectedValue(error);
      await expect(service.findOneById(orgId)).rejects.toThrow(error);
    });
  });
});
