import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from '../service/organization.service';
import { OrganizationController } from './organization.controller';
import { Organization } from '../entity/organization.entity';
import { CreateOrganizationDto } from '../dto/create-organization.dto';

describe('OrganizationController', () => {
  let controller: OrganizationController;

  const mockOrganization: Organization = {
    id: 1,
    name: '<_VALID-ORG-NAME_>',
    created_at: new Date(),
    updated_at: new Date(),
    venues: [],
  };

  const mockOrganizationService = {
    create: jest.fn().mockResolvedValue(mockOrganization),
    findAll: jest.fn().mockResolvedValue([mockOrganization]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        {
          provide: OrganizationService,
          useValue: mockOrganizationService,
        },
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new `Organization`', async () => {
      const mockCreateOrganizationDto: CreateOrganizationDto = {
        name: '<_VALID-ORG-NAME_>',
      };
      expect(await controller.create(mockCreateOrganizationDto)).toEqual(
        mockOrganization,
      );
      expect(mockOrganizationService.create).toHaveBeenCalledWith(
        mockCreateOrganizationDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of all `Organizations`', async () => {
      expect(await controller.findAll()).toEqual([mockOrganization]);
      expect(mockOrganizationService.findAll).toHaveBeenCalled();
    });
  });
});
