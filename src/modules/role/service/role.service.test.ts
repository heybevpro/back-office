import { Role } from '../entity/role.entity';
import { Repository } from 'typeorm';
import { RoleService } from './role.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role as RoleLevel } from '../../../utils/constants/role.constants';
import { UserService } from '../../user/service/user.service';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { User } from '../../user/entity/user.entity';
import {
  BadRequestException,
  ImATeapotException,
  UnauthorizedException,
} from '@nestjs/common';
import { Organization } from '../../organization/entity/organization.entity';

describe('role service', () => {
  let roleRepository: Repository<Role>;
  let service: RoleService;
  let userService: UserService;

  const mockDefaultRole: Role = {
    id: '<_ROLE_ID_>',
    role_name: RoleLevel.GUEST,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUser: User = {
    id: 'user-id',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'password',
    email_verified: true,
    onboarding_complete: true,
    role: { id: 'role-id', role_name: RoleLevel.ADMIN } as Role,
    created_at: new Date(),
    updated_at: new Date(),
    organization: {} as Organization,
  };

  const mockRole: Role = {
    id: 'new-role-id',
    role_name: RoleLevel.MANAGER,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUserService = {
    findOneById: jest.fn(),
    update: jest.fn(),
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
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    userService = module.get<UserService>(UserService);
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

  describe('update', () => {
    it('should update the role successfully', async () => {
      const updateRoleDto: UpdateRoleDto = {
        user: 'target-user-id',
        role: RoleLevel.MANAGER,
      };
      const targetUser: User = { ...mockUser, id: 'target-user-id' };

      jest.spyOn(userService, 'findOneById').mockResolvedValueOnce(mockUser); // Current user
      jest.spyOn(userService, 'findOneById').mockResolvedValueOnce(targetUser); // Target user
      jest.spyOn(roleRepository, 'findOneOrFail').mockResolvedValue(mockRole);
      jest
        .spyOn(userService, 'update')
        .mockResolvedValue({ ...targetUser, role: mockRole });

      const result = await service.update(mockUser.id, updateRoleDto);

      expect(result).toEqual({ ...targetUser, role: mockRole });
      expect(userService.findOneById).toHaveBeenCalledTimes(2);
      expect(roleRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { role_name: RoleLevel.MANAGER },
      });
      expect(userService.update).toHaveBeenCalledWith({
        ...targetUser,
        role: mockRole,
      });
    });

    it('should throw UnauthorizedException for insufficient permissions', async () => {
      const updateRoleDto: UpdateRoleDto = {
        user: 'target-user-id',
        role: RoleLevel.SUPER_ADMIN,
      };

      jest.spyOn(userService, 'findOneById').mockResolvedValue(mockUser);

      await expect(service.update(mockUser.id, updateRoleDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException for invalid user', async () => {
      const updateRoleDto: UpdateRoleDto = {
        user: 'invalid-user-id',
        role: RoleLevel.MANAGER,
      };

      jest.spyOn(userService, 'findOneById').mockResolvedValue(mockUser); // Current user
      jest
        .spyOn(userService, 'update')
        .mockRejectedValue(new ImATeapotException());

      await expect(service.update(mockUser.id, updateRoleDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
