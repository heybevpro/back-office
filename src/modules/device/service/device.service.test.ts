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
} from '../../../excpetions/device.exception';

describe('DeviceService', () => {
  let deviceService: DeviceService;
  let venueService: jest.Mocked<VenueService>;
  let deviceRepository: jest.Mocked<Partial<Repository<Device>>>;

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
  };

  const mockVenueService = {
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
      ],
    }).compile();

    deviceService = module.get(DeviceService);
    venueService = module.get(VenueService);
    deviceRepository = module.get(getRepositoryToken(Device));
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
    it('should return device with venue if found', async () => {
      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(mockDevice);

      const result = await deviceService.findById('device-uuid');

      expect(result).toEqual(mockDevice);
      expect(deviceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'device-uuid' },
        relations: { venue: true },
      });
    });

    it('should throw NotFoundException if device not found', async () => {
      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(null);

      await expect(deviceService.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
