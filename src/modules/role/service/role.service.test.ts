import { Role } from '../entity/role.entity';
import { Repository } from 'typeorm';
import { RoleService } from './role.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role as RoleLevel } from '../../../utils/constants/role.constants';
import { UserService } from '../../user/service/user.service';

describe('role service', () => {
  let roleRepository: Repository<Role>;
  let service: RoleService;

  const mockDefaultRole: Role = {
    id: '<_ROLE_ID_>',
    role_name: RoleLevel.GUEST,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        {
          provide: UserService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the default role as `guest`', async () => {
    jest
      .spyOn(roleRepository, 'findOneOrFail')
      .mockResolvedValue(mockDefaultRole);
    const defaultRole = await service.findDefault();
    expect(defaultRole).toEqual(mockDefaultRole);
  });
});
