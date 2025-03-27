import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Venue } from '../enitity/venue.entity';
import { VenueService } from './venue.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from '../../organization/entity/organization.entity';

describe('VenueService', () => {
  let service: VenueService;
  let venueRepository: Repository<Venue>;

  const mockVenue: Venue = {
    id: 1,
    name: '<_VALID-VENUE-NAME_>',
    organization: {} as Organization,
    created_at: new Date(),
    updated_at: new Date(),
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
      const venueCreateSpy = jest.spyOn(venueRepository, 'create');
      const venueSaveSpy = jest.spyOn(venueRepository, 'save');
      venueCreateSpy.mockReturnValue(mockVenue);
      venueSaveSpy.mockResolvedValue(mockVenue);

      expect(await service.create({ name: '<_VALID-VENUE-NAME_>' })).toEqual(
        mockVenue,
      );
    });
  });

  describe('findAllByOrganization', () => {
    it('should return an array of venues associated with the requested Organization', async () => {
      const findVenueByOrgSpy = jest.spyOn(venueRepository, 'find');
      findVenueByOrgSpy.mockResolvedValue([mockVenue]);
      expect(await service.findAllByOrganization({ organization: 1 })).toEqual([
        mockVenue,
      ]);
    });
  });
});
