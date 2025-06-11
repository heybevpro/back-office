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
import { CreateEmployeeMetadataDto } from '../dto/employee-metadata.dto';
import { S3UploadFailedException } from '../../../excpetions/objects.exception';

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
      jest.spyOn(invitationRepository, 'findOne').mockResolvedValue(null);

      const pin = await service.generateUniquePinForVenue(1);
      expect(pin).toHaveLength(6);
    });

    it('should throw error if unable to generate a unique pin', async () => {
      jest
        .spyOn(invitationRepository, 'findOne')
        .mockResolvedValue(mockInvitation);

      await expect(service.generateUniquePinForVenue(1, 2)).rejects.toThrow(
        'Failed to generate unique PIN for venue',
      );
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
        mockVenue.name,
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

  describe('onboard', () => {
    const mockFile = {
      buffer: Buffer.from('dummy'),
      mimetype: 'application/pdf',
      originalname: 'test.pdf',
    };

    const mockMetadata: CreateEmployeeMetadataDto = {
      first_name: 'Jane',
      last_name: 'Doe',
      address_line1: '123 Main St',
      address_line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      email: 'jane.doe@example.com',
      phone: '+11234567890',
      pin: '123456',
    };

    it('should throw BadRequestException if file is missing', async () => {
      const mockMetadataNoFile = { ...mockMetadata };

      await expect(
        service.onboard(mockMetadataNoFile, undefined as any),
      ).rejects.toThrow(
        new BadRequestException('Uploaded document is required'),
      );
    });

    it('should throw BadRequestException if invitation is not found', async () => {
      jest
        .spyOn(invitationRepository, 'findOneOrFail')
        .mockRejectedValue(new BadRequestException('Not found'));

      await expect(service.onboard(mockMetadata, mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if invitation is not in Onboarding status', async () => {
      const invalidStatusInvitation = {
        ...mockInvitation,
        status: EmployeeInvitationStatus.Review,
      };

      jest
        .spyOn(invitationRepository, 'findOneOrFail')
        .mockResolvedValue(invalidStatusInvitation as EmployeeInvitation);

      await expect(service.onboard(mockMetadata, mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if file upload fails', async () => {
      const uploadError = new S3UploadFailedException();
      jest
        .spyOn(invitationRepository, 'findOneOrFail')
        .mockResolvedValue({ ...mockInvitation });

      jest.spyOn(venueService, 'findOneById').mockResolvedValue(mockVenue);

      jest
        .spyOn(service['objectStoreService'], 'uploadDocument')
        .mockRejectedValue(uploadError);

      await expect(service.onboard(mockMetadata, mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should upload file, update metadata, and return updated invitation', async () => {
      const saveSpy = jest
        .spyOn(invitationRepository, 'save')
        .mockResolvedValue({
          ...mockInvitation,
          userMetadata: mockMetadata,
          documentUrl: 'https://mocked-url.com/document.pdf',
          status: EmployeeInvitationStatus.Review,
        });

      jest
        .spyOn(invitationRepository, 'findOneOrFail')
        .mockResolvedValue({ ...mockInvitation } as EmployeeInvitation);

      jest.spyOn(venueService, 'findOneById').mockResolvedValue(mockVenue);

      const result = await service.onboard(mockMetadata, mockFile);

      expect(invitationRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { pin: mockMetadata.pin },
      });

      expect(venueService.findOneById).toHaveBeenCalledWith(
        mockInvitation.venue.id,
      );
      expect(saveSpy).toHaveBeenCalled();

      expect(result.userMetadata).toEqual(mockMetadata);
      expect(result.documentUrl).toBe('https://mocked-url.com/document.pdf');
      expect(result.status).toBe(EmployeeInvitationStatus.Review);
    });

    it('should throw BadRequestException if saving invitation fails', async () => {
      const saveError = new Error('DB save failed');

      jest
        .spyOn(invitationRepository, 'findOneOrFail')
        .mockResolvedValue({ ...mockInvitation });

      jest.spyOn(venueService, 'findOneById').mockResolvedValue(mockVenue);

      jest
        .spyOn(service['objectStoreService'], 'uploadDocument')
        .mockResolvedValue('https://mocked-url.com/document.pdf');

      jest.spyOn(invitationRepository, 'save').mockRejectedValue(saveError);

      await expect(service.onboard(mockMetadata, mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should wrap other errors in BadRequestException', async () => {
      jest
        .spyOn(invitationRepository, 'findOneOrFail')
        .mockRejectedValue(new BadRequestException('Unexpected'));

      await expect(service.onboard(mockMetadata, mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('fetch invites by venue id', () => {
    it('should fetch all invitations for a given venue id', async () => {
      const venueId = 1;
      const mockInvitations: EmployeeInvitation[] = [
        { ...mockInvitation },
        { ...mockInvitation, id: 'inv-456', email: 'another@example.com' },
      ];

      jest
        .spyOn(invitationRepository, 'find')
        .mockResolvedValue(mockInvitations);

      const result = await service.findAllByVenueId(venueId);

      expect(invitationRepository.find).toHaveBeenCalledWith({
        where: { venue: { id: venueId } },
        relations: { venue: true },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockInvitations);
    });

    it('should return an empty list if no invitations found', async () => {
      const venueId = 2;
      jest.spyOn(invitationRepository, 'find').mockResolvedValue([]);

      const result = await service.findAllByVenueId(venueId);

      expect(invitationRepository.find).toHaveBeenCalledWith({
        where: { venue: { id: venueId } },
        relations: { venue: true },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual([]);
    });
  });
});
