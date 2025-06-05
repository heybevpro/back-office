import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeInvitationController } from './employee-invitation.controller';
import { EmployeeInvitationService } from '../service/employee-invitation.service';
import { EmployeeInvitation } from '../entity/employee-invitation.entity';
import { Status } from '../../../utils/constants/employee.constants';
import { Venue } from '../../venue/entity/venue.entity';
import { CreateEmployeeInvitationDto } from '../dto/employee-invitation.dto';

describe('EmployeeInvitationController', () => {
  let controller: EmployeeInvitationController;
  let service: jest.Mocked<EmployeeInvitationService>;

  const mockInvitation: EmployeeInvitation = {
    id: 'invitation-123',
    email: 'employee@example.com',
    pin: '654321',
    venue: {} as Venue,
    status: Status.OnboardingPending,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockService: Partial<jest.Mocked<EmployeeInvitationService>> = {
    create: jest.fn(),
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
    service = module.get(EmployeeInvitationService);
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
});
