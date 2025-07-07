import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from '../service/organization.service';
import { OrganizationController } from './organization.controller';
import { Organization } from '../entity/organization.entity';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { User } from '../../user/entity/user.entity';
import { OrganizationSize } from '../../../utils/constants/organization.constants';

describe('OrganizationController', () => {
  let controller: OrganizationController;

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
    serving_sizes: [],
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
        address_line1: '123 Main St',
        address_line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        size: OrganizationSize.SMALL,
        phone: '123-456-7890',
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
