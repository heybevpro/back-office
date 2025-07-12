import { Device } from '../entity/device.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Venue } from '../../venue/entity/venue.entity';
import { DeviceController } from './device.controller';
import { DeviceService } from '../service/device.service';
import { Organization } from '../../organization/entity/organization.entity';
import { OrganizationSize } from '../../../utils/constants/organization.constants';
import { User } from 'src/modules/user/entity/user.entity';

describe('DeviceController', () => {
  let controller: DeviceController;

  const mockOrganization: Organization = {
    id: 1,
    name: 'Test Organization',
    address_line1: '123 Test St',
    address_line2: '',
    city: 'Test City',
    state: 'TS',
    zip: '12345',
    size: OrganizationSize.SMALL,
    created_at: new Date(),
    updated_at: new Date(),
    user: {} as User,
    venues: [],
    serving_sizes: [],
  };

  const mockVenue: Venue = {
    id: 1,
    name: 'Test Venue',
    organization: mockOrganization,
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    phone_number: '123-456-7890',
    capacity: 100,
    created_at: new Date(),
    updated_at: new Date(),
    employees: [],
    product_types: [],
    devices: [],
    menu_items: [],
    products: [],
  };

  const mockDevice: Device = {
    id: 'DEVICE_1',
    name: 'Test Device',
    venue: mockVenue,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockDeviceService = {
    create: jest.fn((dto) => Promise.resolve({ ...dto, venue: {} })),
    findById: jest.fn((id: string): Promise<Device> => {
      if (id === 'INVALID_ID') throw new NotFoundException('Device not found');
      return Promise.resolve({} as Device);
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
    it('should return device response with user details and access token', async () => {
      jest
        .spyOn(mockDeviceService, 'findById')
        .mockResolvedValueOnce(mockDevice);
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
});
