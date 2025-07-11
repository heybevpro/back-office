import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Device } from '../entity/device.entity';
import { Venue } from '../../venue/entity/venue.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VenueService } from '../../venue/service/venue.service';
import { DeviceService } from './device.service';
import { Organization } from '../../organization/entity/organization.entity';
import {
  DeviceConflictException,
  VenueNotFoundException,
} from '../../../exceptions/device.exception';
import { AuthenticationService } from '../../authentication/service/authentication.service';
import { UserService } from '../../user/service/user.service';
import { DeviceResponse } from '../../../config/device.configuration';
import { User } from '../../user/entity/user.entity';
import { Role } from '../../role/entity/role.entity';

describe('DeviceService', () => {
  let deviceService: DeviceService;
  let venueService: jest.Mocked<VenueService>;
  let deviceRepository: jest.Mocked<Partial<Repository<Device>>>;
  let authenticationService: jest.Mocked<AuthenticationService>;
  let userService: jest.Mocked<UserService>;

  const mockDevice: Device = {
    id: '<_VALID-DEVICE-ID_>',
    name: 'Unit Test Device',
    venue: {} as Venue,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockOrganization = {
    id: 1,
    name: 'Mock Org',
    created_at: new Date(),
    updated_at: new Date(),
  } as Organization;

  const mockVenue: Venue = {
    id: 1,
    name: 'Mock Venue',
    organization: mockOrganization,
    address: '',
    city: '',
    state: '',
    phone_number: '',
    capacity: 3,
    created_at: new Date(),
    updated_at: new Date(),
    employees: [],
    product_types: [],
    devices: [],
    products: [],
    menu_items: [],
  };

  const mockUser: User = {
    id: 'user-uuid',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'hashed-password',
    email_verified: true,
    onboarding_complete: true,
    created_at: new Date(),
    updated_at: new Date(),
    role: {
      id: 'role-uuid',
      role_name: 'admin',
      created_at: new Date(),
      updated_at: new Date(),
    } as Role,
    organization: mockOrganization,
  };

  const mockVenueService = {
    findOneById: jest.fn(),
  };

  const mockAuthenticationService = {
    generateAccessToken: jest.fn(),
  };

  const mockUserService = {
    findOneById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        {
          provide: getRepositoryToken(Device),
          useClass: Repository,
        },
        {
          provide: VenueService,
          useValue: mockVenueService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    deviceService = module.get(DeviceService);
    venueService = module.get(VenueService);
    deviceRepository = module.get(getRepositoryToken(Device));
    authenticationService = module.get(AuthenticationService);
    userService = module.get(UserService);
  });

  describe('register device', () => {
    it('should create and return a device', async () => {
      const createDevicePayload = {
        id: '<_VALID-DEVICE-ID_>',
        name: 'Unit Test Device',
        venue: 1,
      };

      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(venueService, 'findOneById').mockResolvedValue(mockVenue);
      jest.spyOn(deviceRepository, 'create').mockReturnValue(mockDevice);
      jest.spyOn(deviceRepository, 'save').mockResolvedValue(mockDevice);

      const result = await deviceService.create(createDevicePayload);

      expect(result).toEqual(mockDevice);
    });

    it('should throw BadRequestException if device with same ID exists', async () => {
      const createDevicePayload = {
        id: '<_VALID-DEVICE-ID_>',
        name: 'Unit Test Device',
        venue: 1,
      };

      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(mockDevice);

      await expect(deviceService.create(createDevicePayload)).rejects.toThrow(
        DeviceConflictException,
      );
    });

    it('should throw BadRequestException if venue not found', async () => {
      const createDevicePayload = {
        id: '<_VALID-DEVICE-ID_>',
        name: 'Unit Test Device',
        venue: 1,
      };

      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(venueService, 'findOneById')
        .mockRejectedValue(new VenueNotFoundException(1));

      await expect(deviceService.create(createDevicePayload)).rejects.toThrow(
        VenueNotFoundException,
      );
    });

    it('should throw BadRequestException if Query fails', async () => {
      const createDevicePayload = {
        id: '<_VALID-DEVICE-ID_>',
        name: 'Unit Test Device',
        venue: 1,
      };

      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(venueService, 'findOneById')
        .mockResolvedValue({ id: 1 } as Venue);
      jest.spyOn(deviceRepository, 'create').mockReturnValue(mockDevice);
      jest.spyOn(deviceRepository, 'save').mockRejectedValue(new Error());

      await expect(deviceService.create(createDevicePayload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findById', () => {
    it('should return device response with user details and access token', async () => {
      const deviceWithVenue = { ...mockDevice, venue: mockVenue };
      const mockAccessToken = 'mock-access-token';
      const expectedResponse: DeviceResponse = {
        device: deviceWithVenue,
        user: {
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
          role: mockUser.role.role_name,
          email: mockUser.email,
        },
        access_token: mockAccessToken,
      };

      jest
        .spyOn(deviceRepository, 'findOne')
        .mockResolvedValue(deviceWithVenue);
      jest.spyOn(userService, 'findOneById').mockResolvedValue(mockUser);
      jest
        .spyOn(authenticationService, 'generateAccessToken')
        .mockResolvedValue(mockAccessToken);

      const result = await deviceService.findById('device-uuid', {
        id: 'user-uuid',
      });

      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException if device not found', async () => {
      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(null);

      await expect(
        deviceService.findById('invalid-id', { id: 'user-uuid' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
