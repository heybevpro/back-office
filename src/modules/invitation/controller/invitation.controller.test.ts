import { InvitationController } from './invitation.controller';
import { InvitationService } from '../service/invitation.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Invitation } from '../entity/invitation.entity';
import { InvitationStatus } from '../../../utils/constants/status.constants';

describe('InvitationController', () => {
  let controller: InvitationController;

  const mockInvitation: Invitation = {
    id: 1,
    status: InvitationStatus.PENDING,
    phone_number: '<_VALID-PHONE_>',
    updated_at: new Date(),
    created_at: new Date(),
  };

  const mockInvitationService = {
    fetchAll: jest.fn().mockResolvedValue([mockInvitation]),
    create: jest.fn().mockResolvedValue(mockInvitation),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: InvitationService,
          useValue: mockInvitationService,
        },
      ],
      controllers: [InvitationController],
    }).compile();

    controller = module.get<InvitationController>(InvitationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return the list of all invitations', async () => {
      const response = await controller.findAll();
      expect(mockInvitationService.fetchAll).toHaveBeenCalled();
      expect(response).toEqual([mockInvitation]);
    });
  });

  describe('create', () => {
    it('should return the created invitation', async () => {
      const response = await controller.create({
        phone_number: mockInvitation.phone_number,
      });
      expect(mockInvitationService.create).toHaveBeenCalledWith({
        phone_number: mockInvitation.phone_number,
      });
      expect(response).toEqual(mockInvitation);
    });
  });
});
