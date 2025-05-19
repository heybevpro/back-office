import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeviceService } from './device.service';
import { Device } from '../entity/device.entity';
import { Venue } from '../../venue/entity/venue.entity';
import { Repository } from 'typeorm';
import { ImATeapotException, NotFoundException } from '@nestjs/common';
import { CreateDeviceDto } from '../dto/device.dto';

describe('DeviceService', () => {
  let service: DeviceService;
  let deviceRepository: jest.Mocked<Partial<Repository<Device>>>;
  let venueRepository: jest.Mocked<Partial<Repository<Venue>>>;

  const mockVenue: Venue = {
    id: 1,
    name: 'Test Venue',
    device: null,
  } as unknown as Venue;

  const mockDevice: Device = {
    id: 'device-uuid',
    name: 'Test Device',
    venue: mockVenue,
  } as Device;

  const dto: CreateDeviceDto = {
    id: 'device-uuid',
    name: 'Test Device',
    venue: 1,
  };

  beforeEach(async () => {
    const mockDeviceRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockVenueRepo = {
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        {
          provide: getRepositoryToken(Device),
          useValue: mockDeviceRepo,
        },
        {
          provide: getRepositoryToken(Venue),
          useValue: mockVenueRepo,
        },
      ],
    }).compile();

    service = module.get<DeviceService>(DeviceService);
    deviceRepository = module.get(getRepositoryToken(Device));
    venueRepository = module.get(getRepositoryToken(Venue));
  });

  describe('create', () => {
    it('should create and return a device if all checks pass', async () => {
      jest.spyOn(venueRepository, 'findOne').mockResolvedValue(mockVenue);
      jest.spyOn(deviceRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(deviceRepository, 'create').mockReturnValue(mockDevice);
      jest.spyOn(deviceRepository, 'save').mockResolvedValue(mockDevice);

      const result = await service.create(dto);

      expect(result).toEqual(mockDevice);
      expect(venueRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.venue },
        relations: ['device'],
      });
      expect(deviceRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.id },
      });
      expect(deviceRepository.create).toHaveBeenCalledWith({
        id: dto.id,
        name: dto.name,
        venue: mockVenue,
      });
      expect(deviceRepository.save).toHaveBeenCalledWith(mockDevice);
    });

    it('should throw BadRequestException if venue not found', async () => {
      jest.spyOn(venueRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(
        /unable to create device/i,
      );
    });

    it('should throw BadRequestException if venue already has a device', async () => {
      jest.spyOn(venueRepository, 'findOne').mockResolvedValue({
        ...mockVenue,
        device: mockDevice,
      });

      await expect(service.create(dto)).rejects.toThrow(
        /unable to create device/i,
      );
    });

    it('should throw BadRequestException if device ID already exists', async () => {
      jest.spyOn(venueRepository, 'findOne').mockResolvedValue(mockVenue);
      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(mockDevice);

      await expect(service.create(dto)).rejects.toThrow(
        /unable to create device/i,
      );
    });

    it('should throw custom BadRequestException on unique constraint (venue)', async () => {
      jest.spyOn(venueRepository, 'findOne').mockResolvedValue(mockVenue);
      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(deviceRepository, 'create').mockReturnValue(mockDevice);
      jest.spyOn(deviceRepository, 'save').mockRejectedValue({
        code: '23505',
        driverError: { constraint: 'UQ_aee2fd613164c44bf2f333f186b' },
      });

      await expect(service.create(dto)).rejects.toThrow(
        /unable to create device/i,
      );
    });

    it('should throw custom BadRequestException on duplicate device primary key', async () => {
      jest.spyOn(venueRepository, 'findOne').mockResolvedValue(mockVenue);
      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(deviceRepository, 'create').mockReturnValue(mockDevice);
      jest.spyOn(deviceRepository, 'save').mockRejectedValue({
        code: '23505',
        driverError: { constraint: 'device_pkey' },
      });

      await expect(service.create(dto)).rejects.toThrow(
        /unable to create device/i,
      );
    });

    it('should throw generic BadRequestException on unexpected error', async () => {
      jest.spyOn(venueRepository, 'findOne').mockResolvedValue(mockVenue);
      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(deviceRepository, 'create').mockReturnValue(mockDevice);
      jest
        .spyOn(deviceRepository, 'save')
        .mockRejectedValue(new ImATeapotException());

      await expect(service.create(dto)).rejects.toThrow(
        /unable to create device/i,
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
