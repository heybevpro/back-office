import { InvitationController } from './invitation.controller';
import { InvitationService } from '../service/invitation.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('InvitationController', () => {
  let controller: InvitationController;

  const mockInvitationService = {
    fetchAll: jest.fn(),
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
      await controller.findAll();
      expect(mockInvitationService.fetchAll).toHaveBeenCalled();
    });
  });
});
