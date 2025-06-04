import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeInvitationService } from './employee-invitation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeInvitation } from '../entity/employee-invitation.entity';
import { Venue } from '../../venue/entity/venue.entity';
import { EmailService } from '../../email/service/email.service';
// import { Repository } from 'typeorm';

const mockEmployeeInvitationRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockVenueRepo = () => ({
  findOneOrFail: jest.fn(),
});

const mockEmailService = () => ({
  sendEmployeeInvitationEmail: jest.fn(),
});

describe('EmployeeInvitationService', () => {
  let service: EmployeeInvitationService;
  // let invitationRepo: jest.Mocked<Repository<EmployeeInvitation>>;
  // let venueRepo: jest.Mocked<Repository<Venue>>;
  // let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeInvitationService,
        {
          provide: getRepositoryToken(EmployeeInvitation),
          useFactory: mockEmployeeInvitationRepo,
        },
        { provide: getRepositoryToken(Venue), useFactory: mockVenueRepo },
        { provide: EmailService, useFactory: mockEmailService },
      ],
    }).compile();

    service = module.get<EmployeeInvitationService>(EmployeeInvitationService);
    // invitationRepo = module.get(getRepositoryToken(EmployeeInvitation));
    // venueRepo = module.get(getRepositoryToken(Venue));
    // emailService = module.get(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('create', () => {
  //   const dto = {
  //     email: 'test@example.com',
  //     venue: 1,
  //   };

  //   it('should create and save an invitation if no existing one and venue exists', async () => {
  //     invitationRepo.findOne.mockResolvedValue(null);
  //     venueRepo.findOneOrFail.mockResolvedValue({
  //       id: 1,
  //       name: 'Test Venue',
  //     } as Venue);
  //     invitationRepo.create.mockReturnValue({
  //       ...dto,
  //       pin: '123456',
  //       venue: { id: 1 },
  //     });
  //     invitationRepo.save.mockResolvedValue({ id: 1, ...dto, pin: '123456' });

  //     jest
  //       .spyOn(service, 'generateUniquePinForVenue')
  //       .mockResolvedValue('123456');

  //     const result = await service.create(dto);

  //     expect(service.generateUniquePinForVenue).toHaveBeenCalledWith(
  //       1,
  //       invitationRepo,
  //     );
  //     expect(emailService.sendEmployeeInvitationEmail).toHaveBeenCalledWith(
  //       'test@example.com',
  //       '123456',
  //       'Test Venue',
  //     );
  //     expect(invitationRepo.create).toHaveBeenCalledWith({
  //       ...dto,
  //       pin: '123456',
  //       venue: { id: 1 },
  //     });
  //     expect(invitationRepo.save).toHaveBeenCalled();
  //     expect(result).toEqual({ id: 1, ...dto, pin: '123456' });
  //   });

  //   // it('should throw if an existing invitation is not rejected', async () => {
  //   //   invitationRepo.findOne.mockResolvedValue({
  //   //     status: Status.OnboardingPending,
  //   //   });

  //   //   await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  //   //   expect(service.generateUniquePinForVenue).not.toHaveBeenCalled();
  //   // });

  //   // it('should allow re-invitation if existing invitation was rejected', async () => {
  //   //   invitationRepo.findOne.mockResolvedValue({ status: Status.Rejected });
  //   //   venueRepo.findOneOrFail.mockResolvedValue({
  //   //     id: 1,
  //   //     name: 'Test Venue',
  //   //   } as Venue);
  //   //   jest
  //   //     .spyOn(service, 'generateUniquePinForVenue')
  //   //     .mockResolvedValue('999999');
  //   //   invitationRepo.create.mockReturnValue({
  //   //     ...dto,
  //   //     pin: '999999',
  //   //     venue: { id: 1 },
  //   //   });
  //   //   invitationRepo.save.mockResolvedValue({ id: 2, ...dto, pin: '999999' });

  //   //   const result = await service.create(dto);

  //   //   expect(result).toEqual({ id: 2, ...dto, pin: '999999' });
  //   // });

  //   // it('should throw if venue not found', async () => {
  //   //   invitationRepo.findOne.mockResolvedValue(null);
  //   //   venueRepo.findOneOrFail.mockRejectedValue(new Error('Venue not found'));
  //   //   jest
  //   //     .spyOn(service, 'generateUniquePinForVenue')
  //   //     .mockResolvedValue('123123');

  //   //   await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  //   // });

  //   // it('should throw if generating unique PIN fails', async () => {
  //   //   jest
  //   //     .spyOn(service, 'generateUniquePinForVenue')
  //   //     .mockRejectedValue(new Error('PIN generation failed'));
  //   //   invitationRepo.findOne.mockResolvedValue(null);

  //   //   await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  //   // });
  // });
});
