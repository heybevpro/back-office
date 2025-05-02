import { Test, TestingModule } from '@nestjs/testing';
import { QueryFailedError, Repository } from 'typeorm';
import { Venue } from '../entity/venue.entity';
import { VenueService } from './venue.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from '../../organization/entity/organization.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('VenueService', () => {
  let service: VenueService;
  let venueRepository: Repository<Venue>;

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Venue),
          useClass: Repository,
        },
        VenueService,
      ],
    }).compile();

    service = module.get<VenueService>(VenueService);
    venueRepository = module.get<Repository<Venue>>(getRepositoryToken(Venue));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a venue and return it', async () => {
      const findOneBySpy = jest.spyOn(venueRepository, 'findOneBy');
      const venueCreateSpy = jest.spyOn(venueRepository, 'create');
      const venueSaveSpy = jest.spyOn(venueRepository, 'save');
      findOneBySpy.mockResolvedValue(null);
      venueCreateSpy.mockReturnValue(mockVenue);
      venueSaveSpy.mockResolvedValue(mockVenue);

      expect(
        await service.create({
          name: '<_VALID-VENUE-NAME_>',
          address: '<_VALID_ADDRESS_>',
          city: '<_CITY_>',
          state: '<_STATE_>',
          capacity: 1000,
          phone_number: '<_VALID_PHONE_>',
          organization: 1,
        }),
      ).toEqual(mockVenue);
    });

    it('should throw a BadRequestException when creating a venue with a name that already exists', async () => {
      const findOneBySpy = jest.spyOn(venueRepository, 'findOneBy');
      findOneBySpy.mockResolvedValue({} as Venue);
      await expect(
        service.create({
          name: '<_EXISTING-VENUE-NAME_>',
          address: '<_VALID_ADDRESS_>',
          city: '<_CITY_>',
          state: '<_STATE_>',
          capacity: 1000,
          phone_number: '<_VALID_PHONE_>',
          organization: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllByOrganization', () => {
    it('should return an array of venues associated with the requested Organization', async () => {
      const mockOrganizationId = 1;
      const findVenueByOrgSpy = jest.spyOn(venueRepository, 'find');
      findVenueByOrgSpy.mockResolvedValue([mockVenue]);
      expect(await service.findAllByOrganization(mockOrganizationId)).toEqual([
        mockVenue,
      ]);
    });
  });

  describe('findOneById', () => {
    it('should find a venue by ID and return it', async () => {
      const findOneByOrFailSpy = jest.spyOn(venueRepository, 'findOneByOrFail');
      findOneByOrFailSpy.mockResolvedValue(mockVenue);
      expect(await service.findOneById(1)).toEqual(mockVenue);
      expect(findOneByOrFailSpy).toHaveBeenCalled();
    });

    it('should throw a NotFoundException if the venue is not found', async () => {
      const findOneByOrFailSpy = jest.spyOn(venueRepository, 'findOneByOrFail');
      findOneByOrFailSpy.mockRejectedValue(
        new QueryFailedError('Not Found', [], new Error()),
      );
      await expect(service.findOneById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
