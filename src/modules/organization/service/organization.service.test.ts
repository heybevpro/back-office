import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from '../entity/organization.entity';
import { Repository } from 'typeorm';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let organizationRepository: Repository<Organization>;

  const mockOrganization: Organization = {
    id: 1,
    name: '<_VALID-ORG-NAME_>',
    created_at: new Date(),
    updated_at: new Date(),
    venues: [],
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
  });

  describe('findAll', () => {
    it('should return all organizations', async () => {
      const findAllOrganizationSpy = jest.spyOn(organizationRepository, 'find');
      findAllOrganizationSpy.mockResolvedValue([mockOrganization]);

      expect(await service.findAll()).toEqual([mockOrganization]);
    });
  });
});
