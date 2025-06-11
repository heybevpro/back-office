import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeInvitationController } from './employee-invitation.controller';
import { EmployeeInvitationService } from '../service/employee-invitation.service';
import { EmployeeInvitation } from '../entity/employee-invitation.entity';
import { EmployeeInvitationStatus } from '../../../utils/constants/employee.constants';
import { Venue } from '../../venue/entity/venue.entity';
import {
  CreateEmployeeInvitationDto,
  LoginDto,
  UpdateInvitationStatusDto,
} from '../dto/employee-invitation.dto';
import { CreateEmployeeMetadataDto } from '../dto/employee-metadata.dto';
import { ImATeapotException, NotFoundException } from '@nestjs/common';

describe('EmployeeInvitationController', () => {
  let controller: EmployeeInvitationController;
  let service: EmployeeInvitationService;

  const mockInvitation: EmployeeInvitation = {
    id: 'invitation-123',
    email: 'employee@example.com',
    pin: '654321',
    venue: {} as Venue,
    status: EmployeeInvitationStatus.Onboarding,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockService: Partial<jest.Mocked<EmployeeInvitationService>> = {
    create: jest.fn(),
    onboard: jest.fn(),
    updateStatusUsingVerification: jest.fn(),
    findByInvitationPin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeInvitationController],
      providers: [
        {
          provide: EmployeeInvitationService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeInvitationController>(
      EmployeeInvitationController,
    );
    service = module.get<EmployeeInvitationService>(EmployeeInvitationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendInvite', () => {
    it('should call service.create with DTO and return the result', async () => {
      const dto: CreateEmployeeInvitationDto = {
        email: 'employee@example.com',
        venue: 1,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockInvitation);

      const result = await controller.sendInvite(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockInvitation);
    });
  });

  describe('onboard', () => {
    const dto: CreateEmployeeMetadataDto = {
      first_name: 'John',
      last_name: 'Doe',
      address_line1: '123 Main St',
      address_line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '+1234567890',
      pin: '654321',
    };

    const mockFile = {
      buffer: Buffer.from('Valid Test File'),
      mimetype: 'application/pdf',
      originalname: 'resume.pdf',
    };

    it('should call service.onboard with metadata and file and return the result', async () => {
      const expected = {
        ...mockInvitation,
        status: EmployeeInvitationStatus.Review,
      };
      jest.spyOn(service, 'onboard').mockResolvedValue(expected);

      const result = await controller.onboard(dto, mockFile);

      expect(service.onboard).toHaveBeenCalledWith(dto, mockFile);
      expect(result).toEqual(expected);
    });

    it('should propagate errors from onboard', async () => {
      jest
        .spyOn(service, 'onboard')
        .mockRejectedValue(new Error('Onboarding failed'));

      await expect(controller.onboard(dto, mockFile)).rejects.toThrow(
        'Onboarding failed',
      );
    });
  });

  describe('updateStatus', () => {
    const dto: UpdateInvitationStatusDto = {
      invitationId: '<_VALID-INVITATION-ID_>',
      verified: true,
    };

    it('should call service.updateStatusUsingVerification and return the result', async () => {
      const mockResult = {
        ...mockInvitation,
        status: EmployeeInvitationStatus.Accepted,
      };

      jest
        .spyOn(service, 'updateStatusUsingVerification')
        .mockResolvedValue(mockResult);

      const result = await controller.updateStatus(dto);

      expect(service.updateStatusUsingVerification).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });

    it('should propagate errors from updateStatusUsingVerification', async () => {
      jest
        .spyOn(service, 'updateStatusUsingVerification')
        .mockRejectedValue(new ImATeapotException('Update failed'));

      await expect(controller.updateStatus(dto)).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('login', () => {
    const dto: LoginDto = { pin: '123456' };

    it('should return employee invitation if pin is correct', async () => {
      jest
        .spyOn(service, 'findByInvitationPin')
        .mockResolvedValue(mockInvitation);

      const result = await controller.getStatus(dto);

      expect(service.findByInvitationPin).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockInvitation);
    });

    it('should throw error if pin is not found', async () => {
      const error = new NotFoundException('Invitation not found');
      jest.spyOn(service, 'findByInvitationPin').mockRejectedValue(error);

      await expect(controller.getStatus(dto)).rejects.toThrow(error);
    });
  });
});
