import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeInvitationService } from './employee-invitation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeInvitation } from '../entity/employee-invitation.entity';
import { Repository } from 'typeorm';
import { EmailService } from '../../email/service/email.service';
import { VenueService } from '../../venue/service/venue.service';
import { BadRequestException } from '@nestjs/common';
import { EmployeeInvitationStatus } from '../../../utils/constants/employee.constants';
import { Venue } from '../../venue/entity/venue.entity';
import { Organization } from '../../organization/entity/organization.entity';
import { ObjectStoreService } from '../../object-store/service/object-store.service';

describe('EmployeeInvitationService', () => {
  let service: EmployeeInvitationService;
  let invitationRepository: Repository<EmployeeInvitation>;
  let emailService: EmailService;
  let venueService: VenueService;

  const mockVenue: Venue = {
    id: 1,
    name: 'Mock Venue',
    address: '',
    city: '',
    state: '',
    phone_number: '',
    capacity: 100,
    organization: {
      id: 1,
      name: 'Mock Org',
      created_at: new Date(),
      updated_at: new Date(),
    } as Organization,
    employees: [],
    devices: [],
    product_types: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockInvitation: EmployeeInvitation = {
    id: 'inv-123',
    email: 'test@example.com',
    pin: '123456',
    status: EmployeeInvitationStatus.Onboarding,
    venue: mockVenue,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeInvitationService,
        {
          provide: getRepositoryToken(EmployeeInvitation),
          useClass: Repository,
        },
        {
          provide: EmailService,
          useValue: {
            sendEmployeeInvitationEmail: jest.fn(),
          },
        },
        {
          provide: VenueService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: ObjectStoreService,
          useValue: {
            uploadDocument: jest
              .fn()
              .mockResolvedValue('https://mocked-url.com/document.pdf'),
          },
        },
      ],
    }).compile();

    service = module.get<EmployeeInvitationService>(EmployeeInvitationService);
    invitationRepository = module.get<Repository<EmployeeInvitation>>(
      getRepositoryToken(EmployeeInvitation),
    );
    emailService = module.get<EmailService>(EmailService);
    venueService = module.get<VenueService>(VenueService);
  });

  describe('generatePin', () => {
    it('should generate a 6-digit pin as string', () => {
      const pin = service.generatePin();
      expect(pin).toHaveLength(6);
      expect(typeof pin).toBe('string');
    });
  });

  describe('generateUniquePinForVenue', () => {
    it('should generate a unique pin within maxAttempts', async () => {
      const mockRepo: Partial<Repository<EmployeeInvitation>> = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const repo = mockRepo as Repository<EmployeeInvitation>;

      const pin = await service.generateUniquePinForVenue(1, repo);
      expect(pin).toHaveLength(6);
    });

    it('should throw error if unable to generate a unique pin', async () => {
      const mockRepo: Partial<Repository<EmployeeInvitation>> = {
        findOne: jest.fn().mockResolvedValue(mockInvitation),
      };
      const repo = mockRepo as Repository<EmployeeInvitation>;
      await expect(
        service.generateUniquePinForVenue(1, repo, 2),
      ).rejects.toThrow('Failed to generate unique PIN for venue');
    });
  });

  describe('create', () => {
    const dto = {
      email: 'test@example.com',
      venue: 1,
    };

    it('should throw if invitation already exists and not rejected', async () => {
      jest
        .spyOn(invitationRepository, 'findOne')
        .mockResolvedValue(mockInvitation);

      await expect(service.create(dto)).rejects.toThrow(
        new BadRequestException('Invitation already exists'),
      );
    });

    it('should create and return an invitation', async () => {
      jest.spyOn(invitationRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(venueService, 'findOneById').mockResolvedValue(mockVenue);

      const createdInvitation: EmployeeInvitation = {
        ...mockInvitation,
        pin: '123456',
      };

      jest
        .spyOn(invitationRepository, 'create')
        .mockReturnValue(createdInvitation);
      jest
        .spyOn(invitationRepository, 'save')
        .mockResolvedValue(createdInvitation);

      jest
        .spyOn(service, 'generateUniquePinForVenue')
        .mockResolvedValue('123456');

      const result = await service.create(dto);

      expect(emailService.sendEmployeeInvitationEmail).toHaveBeenCalledWith(
        dto.email,
        '123456',
        mockVenue.organization.name,
      );
      expect(invitationRepository.create).toHaveBeenCalledWith({
        ...dto,
        pin: '123456',
        venue: { id: dto.venue },
      });
      expect(result).toEqual(createdInvitation);
    });

    it('should wrap and rethrow any unexpected errors as BadRequestException', async () => {
      jest
        .spyOn(invitationRepository, 'findOne')
        .mockRejectedValue(new Error('Unexpected DB Error'));

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });
});
