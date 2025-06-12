import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeInvitationService } from './employee-invitation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeInvitation } from '../entity/employee-invitation.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { EmailService } from '../../email/service/email.service';
import { VenueService } from '../../venue/service/venue.service';
import {
  BadRequestException,
  ImATeapotException,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeInvitationStatus } from '../../../utils/constants/employee.constants';
import { Venue } from '../../venue/entity/venue.entity';
import { Organization } from '../../organization/entity/organization.entity';
import { ObjectStoreService } from '../../object-store/service/object-store.service';
import { CreateEmployeeMetadataDtoWithDoc } from '../dto/employee-metadata.dto';
import { S3UploadFailedException } from '../../../excpetions/objects.exception';
import { EmployeeService } from '../../employee/service/employee.service';
import { UpdateInvitationStatusDto } from '../dto/employee-invitation.dto';
import {
  InvalidInvitationStatusException,
  InvitationAlreadyExistsException,
} from '../../../excpetions/employee.exception';

describe('EmployeeInvitationService', () => {
  let service: EmployeeInvitationService;
  let invitationRepository: Repository<EmployeeInvitation>;
  let employeeService: EmployeeService;
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
          provide: EmployeeService,
          useValue: {
            create: jest.fn(),
          },
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
    employeeService = module.get<EmployeeService>(EmployeeService);
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
        InvitationAlreadyExistsException,
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

    it('should allow creating a new invitation if previous one was Rejected', async () => {
      const rejectedInvitation = {
        ...mockInvitation,
        status: EmployeeInvitationStatus.Rejected,
        pin: '123456',
      };

      jest
        .spyOn(invitationRepository, 'findOne')
        .mockResolvedValue(rejectedInvitation);
      jest.spyOn(venueService, 'findOneById').mockResolvedValue(mockVenue);
      jest
        .spyOn(invitationRepository, 'create')
        .mockReturnValue(mockInvitation);
      jest
        .spyOn(invitationRepository, 'save')
        .mockResolvedValue(mockInvitation);
      jest
        .spyOn(service, 'generateUniquePinForVenue')
        .mockResolvedValue('123456');

      const result = await service.create(dto);

      expect(result.pin).toBe('123456');
      expect(result.email).toBe('test@example.com');
    });

    it('should wrap repository save errors as BadRequestException', async () => {
      jest.spyOn(invitationRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(venueService, 'findOneById').mockResolvedValue(mockVenue);
      jest
        .spyOn(service, 'generateUniquePinForVenue')
        .mockResolvedValue('123456');
      jest
        .spyOn(emailService, 'sendEmployeeInvitationEmail')
        .mockResolvedValue(undefined);

      const mockError = new Error('Database save failed');
      jest.spyOn(invitationRepository, 'save').mockRejectedValue(mockError);

      try {
        await service.create(dto);
        fail('Expected the method to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('onboard', () => {
    const mockFile = {
      buffer: Buffer.from('dummy'),
      mimetype: 'application/pdf',
      originalname: 'test.pdf',
    };

    const mockMetadata: CreateEmployeeMetadataDtoWithDoc = {
      first_name: 'Jane',
      last_name: 'Doe',
      address_line1: '123 Main St',
      address_line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '+11234567890',
      pin: '123456',
      document: 'testDoc.pdf',
    };

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
        .mockResolvedValue(invalidStatusInvitation);

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
        S3UploadFailedException,
      );
    });

    it('should upload file, update metadata, and return updated invitation', async () => {
      const saveSpy = jest
        .spyOn(invitationRepository, 'save')
        .mockResolvedValue({
          ...mockInvitation,
          userMetadata: mockMetadata,
          status: EmployeeInvitationStatus.Review,
        });

      jest
        .spyOn(invitationRepository, 'findOneOrFail')
        .mockResolvedValue({ ...mockInvitation });

      jest.spyOn(venueService, 'findOneById').mockResolvedValue(mockVenue);

      const result = await service.onboard(mockMetadata, mockFile);

      expect(invitationRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { pin: mockMetadata.pin },
        relations: {
          venue: true,
        },
      });

      expect(venueService.findOneById).toHaveBeenCalledWith(
        mockInvitation.venue.id,
      );
      expect(saveSpy).toHaveBeenCalled();

      expect(result.userMetadata).toEqual(mockMetadata);
      expect(result.status).toBe(EmployeeInvitationStatus.Review);
    });

    it('should throw BadRequestException if saving invitation fails', async () => {
      const saveError = new ImATeapotException('DB save failed');

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

  describe('updateStatusUsingVerification', () => {
    const mockUpdateDto: UpdateInvitationStatusDto = {
      invitationId: '<_VALID-INVITATION-ID_>',
      verified: true,
    };

    const mockUserMetadata = {
      first_name: 'John',
      last_name: 'Doe',
      address_line1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '+1234567890',
      document: 'https://example.com/doc.pdf',
      pin: '123456',
    };

    const mockEmployee = {
      ...mockUserMetadata,
      id: 'emp-001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      address_line2: '',
      pin: '123456',
      venue: mockVenue,
      employee_verified: true,
      employee_invite: { id: '<_VALID-INVITATION-ID_>' } as EmployeeInvitation,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should throw if invitation is not in Review status', async () => {
      const invalidStatusInvitation = {
        ...mockInvitation,
        status: EmployeeInvitationStatus.Onboarding,
      };

      jest
        .spyOn(invitationRepository, 'findOneOrFail')
        .mockResolvedValue(invalidStatusInvitation);

      await expect(
        service.updateStatusUsingVerification(mockUpdateDto),
      ).rejects.toThrow(InvalidInvitationStatusException);
    });

    it('should set status to Rejected when verified is false', async () => {
      const reviewInvitation = {
        ...mockInvitation,
        status: EmployeeInvitationStatus.Review,
      };

      jest
        .spyOn(invitationRepository, 'findOneOrFail')
        .mockResolvedValue(reviewInvitation);

      jest.spyOn(invitationRepository, 'save').mockResolvedValue({
        ...reviewInvitation,
        status: EmployeeInvitationStatus.Rejected,
      });

      const result = await service.updateStatusUsingVerification({
        ...mockUpdateDto,
        verified: false,
      });

      expect(result).toEqual({
        ...mockInvitation,
        status: EmployeeInvitationStatus.Rejected,
      });
    });

    it('should throw if metadata is missing when verified is true', async () => {
      const reviewInvitation = {
        ...mockInvitation,
        status: EmployeeInvitationStatus.Review,
        userMetadata: undefined,
      };

      jest
        .spyOn(invitationRepository, 'findOneOrFail')
        .mockResolvedValue(reviewInvitation);

      await expect(
        service.updateStatusUsingVerification(mockUpdateDto),
      ).rejects.toThrow('Missing user metadata for accepted invitation');
    });

    it('should create employee and update status when verified is true', async () => {
      const reviewInvitation = {
        ...mockInvitation,
        status: EmployeeInvitationStatus.Review,
        userMetadata: mockUserMetadata,
      };

      jest
        .spyOn(invitationRepository, 'findOneOrFail')
        .mockResolvedValue(reviewInvitation);

      jest.spyOn(employeeService, 'create').mockResolvedValue(mockEmployee);

      jest.spyOn(invitationRepository, 'save').mockResolvedValue({
        ...reviewInvitation,
        status: EmployeeInvitationStatus.Accepted,
      });

      const result = await service.updateStatusUsingVerification(mockUpdateDto);

      expect(result).toEqual({
        ...mockInvitation,
        status: EmployeeInvitationStatus.Accepted,
        userMetadata: mockUserMetadata,
      });
    });

    it('should throw BadRequestException if employee creation fails', async () => {
      const reviewInvitation = {
        ...mockInvitation,
        status: EmployeeInvitationStatus.Review,
        userMetadata: mockUserMetadata,
      };
      const mockError = new Error('Something went wrong');

      jest
        .spyOn(invitationRepository, 'findOneOrFail')
        .mockResolvedValue(reviewInvitation);

      jest.spyOn(employeeService, 'create').mockRejectedValue(mockError);

      await expect(
        service.updateStatusUsingVerification(mockUpdateDto),
      ).rejects.toThrow('Failed to create employee or update invitation');
    });
  });

  describe('findByInvitationPin', () => {
    const dto = {
      pin: '123456',
    };

    it('should return employee invitation for valid pin', async () => {
      jest
        .spyOn(invitationRepository, 'findOneByOrFail')
        .mockResolvedValue(mockInvitation);

      const result = await service.findByInvitationPin(dto);
      expect(result).toEqual(mockInvitation);
    });

    it('should throw NotFoundException if pin not found', async () => {
      jest
        .spyOn(invitationRepository, 'findOneByOrFail')
        .mockRejectedValue(
          new EntityNotFoundError(EmployeeInvitation, { pin: '999999' }),
        );

      await expect(service.findByInvitationPin(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should rethrow unknown errors from findByInvitationPin', async () => {
      jest
        .spyOn(invitationRepository, 'findOneByOrFail')
        .mockRejectedValue(new Error('Database crash'));

      await expect(service.findByInvitationPin(dto)).rejects.toThrow(
        'Database crash',
      );
    });
  });
});
