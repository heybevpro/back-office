import { VenueService } from '../service/venue.service';
import { VenueController } from './venue.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { Venue } from '../entity/venue.entity';
import { Organization } from '../../organization/entity/organization.entity';

describe('VenueController', () => {
  let controller: VenueController;

  const mockEmployee = {
    id: 'employee-uuid',
    first_name: 'John',
    last_name: 'Doe',
    address_line1: '123 Main St',
    address_line2: undefined,
    city: 'Sample City',
    state: 'Sample State',
    zip: '12345',
    email: 'john.doe@example.com',
    phone: '555-1234',
    pin: '1234',
    venues: [],
    employee_verified: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockDevice = {
    id: 'device-uuid',
    name: 'Device One',
    venue: {} as Venue,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockVenue: Venue = {
    id: 1,
    name: '<_VALID-VENUE-NAME_>',
    organization: { id: 1 } as Organization,
    address: '<_VALID_ADDRESS_>',
    capacity: 100,
    city: '<_CITY_>',
    phone_number: '<_VALID_PHONE_>',
    state: '<_STATE_>',
    created_at: new Date(),
    updated_at: new Date(),
    product_types: [],
    employee: mockEmployee,
    device: mockDevice,
  };

  const mockVenueService = {
    create: jest.fn().mockResolvedValue(mockVenue),
    findAllByOrganization: jest.fn().mockResolvedValue([mockVenue]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: VenueService, useValue: mockVenueService }],
      controllers: [VenueController],
    }).compile();
    controller = module.get<VenueController>(VenueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call the `create` method from the Venue Service', async () => {
      expect(
        await controller.create({
          name: '<_VALID-VENUE-NAME_>',
          address: '<_VALID_ADDRESS_>',
          city: '<_CITY_>',
          state: '<_STATE_>',
          capacity: 1000,
          phone_number: '<_VALID_PHONE_>',
          organization: 1,
        }),
      ).toEqual(mockVenue);
      expect(mockVenueService.create).toHaveBeenCalledWith({
        name: '<_VALID-VENUE-NAME_>',
        address: '<_VALID_ADDRESS_>',
        city: '<_CITY_>',
        state: '<_STATE_>',
        capacity: 1000,
        phone_number: '<_VALID_PHONE_>',
        organization: 1,
      });
    });
  });

  describe('findByOrganization', () => {
    const mockOrganizationId: number = 1;

    it('should call the `findAllByOrganization` method from the Venue Service', async () => {
      await controller.findByOrganization(mockOrganizationId);
      expect(mockVenueService.findAllByOrganization).toHaveBeenCalledWith(
        mockOrganizationId,
      );
    });
    it('should return all venues associated with an `Organization`', async () => {
      expect(await controller.findByOrganization(mockOrganizationId)).toEqual([
        mockVenue,
      ]);
    });
  });
});
