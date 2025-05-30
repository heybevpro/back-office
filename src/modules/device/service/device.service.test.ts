import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Device } from '../entity/device.entity';
import { Venue } from '../../venue/entity/venue.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeviceService } from './device.service';

describe('DeviceService', () => {
  let service: DeviceService;
  let deviceRepository: jest.Mocked<Partial<Repository<Device>>>;
  let venueRepository: jest.Mocked<Partial<Repository<Venue>>>;

  const mockDevice: Device = {
    id: '<_VALID-DEVICE-ID_>',
    name: 'Unit Test Device',
    venue: {},
  } as Device;

  beforeEach(async () => {
    venueRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        {
          provide: getRepositoryToken(Device),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Venue),
          useValue: venueRepository,
        },
      ],
    }).compile();

    service = module.get<DeviceService>(DeviceService);
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
      jest
        .spyOn(venueRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as Venue);
      jest.spyOn(deviceRepository, 'create').mockReturnValue(mockDevice);
      jest.spyOn(deviceRepository, 'save').mockResolvedValue(mockDevice);

      const result = await service.create(createDevicePayload);

      expect(result).toEqual(mockDevice);
    });

    it('should throw BadRequestException if device with same ID exists', async () => {
      const createDevicePayload = {
        id: '<_VALID-DEVICE-ID_>',
        name: 'Unit Test Device',
        venue: 1,
      };

      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(mockDevice);

      await expect(service.create(createDevicePayload)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDevicePayload)).rejects.toThrow(
        /Device with serial number <_VALID-DEVICE-ID_> is already registered./,
      );
    });

    it('should throw BadRequestException if venue not found', async () => {
      const createDevicePayload = {
        id: '<_VALID-DEVICE-ID_>',
        name: 'Unit Test Device',
        venue: 1,
      };

      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(venueRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(createDevicePayload)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDevicePayload)).rejects.toThrow(
        /Venue with ID 1 not found./,
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
        .spyOn(venueRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as Venue);
      jest.spyOn(deviceRepository, 'create').mockReturnValue(mockDevice);
      jest.spyOn(deviceRepository, 'save').mockRejectedValue(new Error());

      await expect(service.create(createDevicePayload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findById', () => {
    it('should return device with venue if found', async () => {
      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(mockDevice);

      const result = await service.findById('device-uuid');

      expect(result).toEqual(mockDevice);
      expect(deviceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'device-uuid' },
        relations: { venue: true },
      });
    });

    it('should throw NotFoundException if device not found', async () => {
      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
