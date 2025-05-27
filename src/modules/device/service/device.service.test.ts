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

  const mockVenue: Venue = {
    id: 1,
    name: 'Test Venue',
    device: null,
  } as unknown as Venue;

  const mockDevice: Device = {
    id: '<_VALID-DEVICE-ID_>',
    name: 'Unit Test Device',
    venue: mockVenue,
  } as Device;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        {
          provide: getRepositoryToken(Device),
          useClass: Repository,
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

      jest.spyOn(deviceRepository, 'create').mockReturnValue(mockDevice);
      jest.spyOn(deviceRepository, 'save').mockResolvedValue(mockDevice);

      const result = await service.create(createDevicePayload);

      expect(result).toEqual(mockDevice);
    });

    it('should throw BadRequestException if Query fails', async () => {
      const createDevicePayload = {
        id: '<_VALID-DEVICE-ID_>',
        name: 'Unit Test Device',
        venue: 1,
      };

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
