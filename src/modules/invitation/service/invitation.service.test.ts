import { InvitationService } from './invitation.service';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Invitation } from '../entity/invitation.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvitationStatus } from '../../../utils/constants/status.constants';

describe('InvitationService', () => {
  let service: InvitationService;
  let invitationRepository: Repository<Invitation>;

  const mockInvitation: Invitation = {
    id: 1,
    phone_number: '<_VALID-PHONE_>',
    status: InvitationStatus.PENDING,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Invitation),
          useClass: Repository,
        },
        InvitationService,
      ],
    }).compile();

    service = module.get<InvitationService>(InvitationService);
    invitationRepository = module.get<Repository<Invitation>>(
      getRepositoryToken(Invitation),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new Invitation Record using the TypeORM API', async () => {
      const createInvitationSpy = jest.spyOn(invitationRepository, 'create');
      const saveInvitationSpy = jest.spyOn(invitationRepository, 'save');

      createInvitationSpy.mockReturnValue(mockInvitation);
      saveInvitationSpy.mockResolvedValue(mockInvitation);

      expect(await service.create({ phone_number: '<_VALID-PHONE_>' })).toEqual(
        mockInvitation,
      );
    });
  });

  describe('fetchAll', () => {
    it('should return an array of all invitations', async () => {
      const invitationFindAllSpy = jest.spyOn(invitationRepository, 'find');
      invitationFindAllSpy.mockResolvedValue([mockInvitation]);

      expect(await service.fetchAll()).toEqual([mockInvitation]);
      expect(invitationFindAllSpy).toHaveBeenCalledWith();
    });
  });

  describe('fetchById', () => {
    it('should return an invitation by its ID', async () => {
      const invitationFindOneSpy = jest.spyOn(invitationRepository, 'findOne');
      invitationFindOneSpy.mockResolvedValue(mockInvitation);

      expect(await service.fetchById(1)).toEqual(mockInvitation);
      expect(invitationFindOneSpy).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if no invitation is found', async () => {
      const invitationFindOneSpy = jest.spyOn(invitationRepository, 'findOne');
      invitationFindOneSpy.mockResolvedValue(null);

      expect(await service.fetchById(999)).toBeNull();
      expect(invitationFindOneSpy).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });
});
