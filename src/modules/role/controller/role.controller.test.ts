import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from '../service/role.service';
import { UnauthorizedException } from '@nestjs/common';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from '../../../utils/constants/role.constants';

describe('RoleController - update', () => {
  let controller: RoleController;
  let roleService: RoleService;

  const mockRoleService = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    roleService = module.get<RoleService>(RoleService);
  });

  it('updates the role successfully', async () => {
    const mockRequest = { user: { id: 'user-id' } };
    const updateRoleDto: UpdateRoleDto = {
      user: 'target-user-id',
      role: Role.MANAGER,
    };
    const updatedUser = {
      id: 'target-user-id',
      first_name: '<_VALID_FIRST_NAME_>',
      last_name: '<_VALID_LAST_NAME_>',
      email: '<_VALID_EMAIL_>',
      updated_at: new Date(),
      password: '<_VALID_PASSWORD>',
      created_at: new Date(),
      role: {
        id: '<_VALID_ROLE_ID_>',
        role_name: Role.MANAGER,
        created_at: new Date(),
        updated_at: new Date(),
      },
    };

    jest.spyOn(roleService, 'update').mockResolvedValue(updatedUser);

    const result = await controller.update(mockRequest, updateRoleDto);

    expect(result).toEqual(updatedUser);
    expect(roleService.update).toHaveBeenCalledWith('user-id', updateRoleDto);
  });

  it('throws UnauthorizedException when user is not authorized', async () => {
    const mockRequest = { user: { id: 'user-id' } };
    const updateRoleDto: UpdateRoleDto = {
      user: 'target-user-id',
      role: Role.SUPER_ADMIN,
    };

    jest
      .spyOn(roleService, 'update')
      .mockRejectedValue(new UnauthorizedException());

    await expect(controller.update(mockRequest, updateRoleDto)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(roleService.update).toHaveBeenCalledWith('user-id', updateRoleDto);
  });

  it('handles database exceptions gracefully', async () => {
    const mockRequest = { user: { id: 'user-id' } };
    const updateRoleDto: UpdateRoleDto = {
      user: 'target-user-id',
      role: Role.SUPER_ADMIN,
    };

    await expect(controller.update(mockRequest, updateRoleDto)).rejects.toThrow(
      Error,
    );
    expect(roleService.update).toHaveBeenCalledWith('user-id', updateRoleDto);
  });
});
