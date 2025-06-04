import { Test, TestingModule } from '@nestjs/testing';
// import { Status } from '../../../utils/constants/employee.constants';
import { EmployeeInvitationController } from './employee-invitation.controller';
import { EmployeeInvitationService } from '../service/employee-invitation.service';
// import { EmployeeInvitation } from '../entity/employee-invitation.entity';
// import { CreateEmployeeInvitationDto } from '../dto/employee-invitation.dto';

describe('EmployeeInvitationController', () => {
  let controller: EmployeeInvitationController;
  // let service: jest.Mocked<EmployeeInvitationService>;

  // FIXME: fix mock data
  // const mockEmployeeInvitation: EmployeeInvitation = {
  //   id: '<VALID_ID>',
  //   email: 'john@example.com',
  //   pin: '123456',
  //   status: Status.OnboardingPending,
  //   created_at: new Date(),
  //   updated_at: new Date(),
  // } as EmployeeInvitation;

  const mockEmployeeInvitationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserPin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeInvitationController],
      providers: [
        {
          provide: EmployeeInvitationService,
          useValue: mockEmployeeInvitationService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeInvitationController>(
      EmployeeInvitationController,
    );
    // service = module.get(EmployeeInvitationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('create employee', () => {
  //   it('should create and return an employee', async () => {
  //     const dto = {
  //       ...mockEmployeeInvitation,
  //       id: 'EMPLOYEE-ID',
  //       created_at: new Date(),
  //       updated_at: new Date(),
  //     } as unknown as CreateEmployeeInvitationDto;

  //     service.create.mockResolvedValue(mockEmployeeInvitation);

  //     const result = await controller.create(dto);

  //     // expect(service.create).toHaveBeenCalledWith(dto);
  //     // expect(result).toEqual(mockEmployeeInvitation);
  //   });
  // });
});
