import { Device } from '../entity/device.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Venue } from '../../venue/entity/venue.entity';
import { DeviceController } from './device.controller';
import { DeviceService } from '../service/device.service';

describe('DeviceController', () => {
  let controller: DeviceController;

  const mockDevice: Device = {
    id: 'DEVICE_1',
    name: 'Test Device',
    venue: {} as Venue,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockDeviceService = {
    create: jest.fn((dto) => Promise.resolve({ ...dto, venue: {} })),
    findById: jest.fn((id: string) => {
      if (id === 'DEVICE_1') return Promise.resolve(mockDevice);
      throw new NotFoundException('Device not found');
    }),
    findAllByVenueId: jest.fn((venueId: number) => {
      if (venueId === 1) return Promise.resolve([mockDevice]);
      throw new NotFoundException('Devices not found');
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [{ provide: DeviceService, useValue: mockDeviceService }],
    }).compile();

    controller = module.get<DeviceController>(DeviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create device', () => {
    it('should create and return the device', async () => {
      const dto = { id: 'DEVICE_1', name: 'Test Device', venue: 1 };
      const result = await controller.create(dto);
      expect(result).toEqual({ ...dto, venue: {} });
      expect(mockDeviceService.create).toHaveBeenCalledTimes(1);
      expect(mockDeviceService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('find device by ID', () => {
    it('should return the device if found', async () => {
      const result = await controller.findById('DEVICE_1');
      expect(result).toEqual(mockDevice);
      expect(mockDeviceService.findById).toHaveBeenCalledTimes(1);
      expect(mockDeviceService.findById).toHaveBeenCalledWith('DEVICE_1');
    });

    it('should throw a NotFoundException if device is not found', async () => {
      await expect(controller.findById('INVALID_ID')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockDeviceService.findById).toHaveBeenCalledWith('INVALID_ID');
    });
  });

  describe('find all devices by venue ID', () => {
    it('should return all devices for a given venue ID', async () => {
      const result = await controller.findAllByVenueId(1);
      expect(result).toEqual([mockDevice]);
      expect(mockDeviceService.findAllByVenueId).toHaveBeenCalledTimes(1);
      expect(mockDeviceService.findAllByVenueId).toHaveBeenCalledWith(1);
    });
  });
});
