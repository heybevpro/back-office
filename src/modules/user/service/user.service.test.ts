import { EntityNotFoundError, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import {
  ConflictException,
  ImATeapotException,
  NotFoundException,
} from '@nestjs/common';
import { UserNotFoundException } from '../../../excpetions/credentials.exception';
import { CreateUserDto } from '../dto/create-user.dto';
import { Role } from '../../role/entity/role.entity';
import { RoleService } from '../../role/service/role.service';
import { Role as RoleLevel } from '../../../utils/constants/role.constants';
import { Organization } from '../../organization/entity/organization.entity';
import { OrganizationService } from '../../organization/service/organization.service';
import { OrganizationSize } from '../../../utils/constants/organization.constants';

describe('UserService', () => {
  let userRepository: Repository<User>;
  let service: UserService;
  const mockUser: User = {
    id: '<_USER_ID_>',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@email.com',
    password: '<_PASSWORD_>',
    email_verified: true,
    onboarding_complete: true,
    role: { id: 'Role-ID', role_name: 'VALID_ROLE_NAME' } as unknown as Role,
    created_at: new Date(),
    updated_at: new Date(),
    organization: {} as Organization,
  };

  const mockCreateUserDto: CreateUserDto = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'password',
  };

  const mockRoleService = {
    findDefault: jest.fn(() => Promise.resolve(mockUser.role)),
  };

  const mockOrganizationService = {
    create: jest.fn(() => Promise.resolve(mockUser.organization)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
        {
          provide: OrganizationService,
          useValue: mockOrganizationService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('find one user by ID', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should return the user if found', async () => {
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(mockUser);
      expect(await service.findOneById('<_ID_>')).toEqual(mockUser);
    });

    it('should throw a Not Found Exception if user is not found', async () => {
      jest
        .spyOn(userRepository, 'findOneOrFail')
        .mockRejectedValue(new ImATeapotException());

      await expect(service.findOneById('<_INVALID-ID_>')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('find user by email', () => {
    it('should return the user if found', async () => {
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(mockUser);
      expect(await service.findOneByEmail('<_EMAIL_>')).toEqual(mockUser);
    });

    it('should throw a Not Found Exception if user is not found', async () => {
      jest
        .spyOn(userRepository, 'findOneOrFail')
        .mockRejectedValue(new EntityNotFoundError(User, {}));
      await expect(service.findOneByEmail('<_INVALID_EMAIL_>')).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it('should throw an error if an unexpected error occurs', async () => {
      jest
        .spyOn(userRepository, 'findOneOrFail')
        .mockRejectedValue(new ImATeapotException());
      await expect(service.findOneByEmail('<_EMAIL_>')).rejects.toThrow(
        ImATeapotException,
      );
    });
  });

  describe('find all', () => {
    it('should return all users', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue([mockUser]);
      await expect(service.findAll()).resolves.toEqual([mockUser]);
    });

    it('should return all users except the logged-in user', async () => {
      const loggedInUserId = 'logged-in-user-id';
      jest.spyOn(userRepository, 'find').mockResolvedValue([mockUser]);
      await expect(
        service.findAllExceptLoggedInUser(loggedInUserId),
      ).resolves.toEqual([mockUser]);
    });
  });

  describe('findOneByIdAndRole', () => {
    it('should return the user if found', async () => {
      const findOneOrFailSpy = jest.spyOn(userRepository, 'findOneOrFail');
      findOneOrFailSpy.mockResolvedValue(mockUser);
      expect(
        await service.findOneByIdAndRole('<_ID_>', RoleLevel.ADMIN),
      ).toEqual(mockUser);
      expect(findOneOrFailSpy).toHaveBeenCalledWith({
        where: { id: '<_ID_>', role: { role_name: RoleLevel.ADMIN } },
        relations: { role: true },
      });
    });

    it('should throw a Not Found Exception if user is not found', async () => {
      jest
        .spyOn(userRepository, 'findOneOrFail')
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.findOneByIdAndRole('<_INVALID-ID_>', RoleLevel.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markUserEmailAsVerified', () => {
    it('should update the user email_verified field and return the user', async () => {
      const userWithVerifiedEmail = { ...mockUser, email_verified: true };
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(mockUser);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(userWithVerifiedEmail);

      const result = await service.markUserEmailAsVerified(mockUser.email);
      expect(result).toEqual(userWithVerifiedEmail);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserSpy = jest.spyOn(userRepository, 'create');
      const saveUserSpy = jest.spyOn(userRepository, 'save');
      createUserSpy.mockReturnValue(mockUser);
      saveUserSpy.mockResolvedValue(mockUser);

      const result = await service.create(mockCreateUserDto);
      expect(result).toEqual(mockUser);
      expect(createUserSpy).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        role: mockUser.role,
      });
      expect(saveUserSpy).toHaveBeenCalledWith(mockUser);
    });
    it('should throw a conflict exception if user with email already exists', async () => {
      const createUserSpy = jest.spyOn(userRepository, 'create');
      const saveUserSpy = jest.spyOn(userRepository, 'save');
      createUserSpy.mockReturnValue(mockUser);
      saveUserSpy.mockRejectedValue(new ImATeapotException());

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(createUserSpy).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        role: mockUser.role,
      });
      expect(saveUserSpy).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updatedUser = { ...mockUser, first_name: '<_UPDATED_NAME_>' };
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);
      const result = await service.update(mockUser);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('updateUserPasswordHash', () => {
    it('should update the user password field and return the user', async () => {
      const mockUserId = '<_USER_ID_>';
      const mockUserPasswordHash = '<_PASSWORD_HASH_NEW_>';
      const findOneOrFailSpy = jest.spyOn(userRepository, 'findOneOrFail');
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue({ ...mockUser, password: mockUserPasswordHash });
      findOneOrFailSpy.mockResolvedValue(mockUser);
      expect(
        await service.updateUserPasswordHash(mockUserId, mockUserPasswordHash),
      ).toEqual({
        ...mockUser,
        password: mockUserPasswordHash,
      });
    });
  });

  describe('onboardUser', () => {
    it('should update the user email_verified field and return the user', async () => {
      const mockUserId = '<_USER_ID_>';
      const mockAccountOnboardingDto = {
        name: 'Test Organization',
        phone: '+11234567890',
        address_line1: '123 Main St',
        address_line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        size: OrganizationSize.SMALL,
      };
      const findOneOrFailSpy = jest.spyOn(userRepository, 'findOneOrFail');
      findOneOrFailSpy.mockResolvedValue(mockUser);
      const userRepositorySaveSpy = jest.spyOn(userRepository, 'save');
      userRepositorySaveSpy.mockResolvedValue({
        ...mockUser,
        onboarding_complete: true,
      });
      const result = await service.onboardUser(
        mockUserId,
        mockAccountOnboardingDto,
      );
      expect(result).toEqual(mockUser);
      expect(findOneOrFailSpy).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
      expect(mockOrganizationService.create).toHaveBeenCalledWith(
        mockAccountOnboardingDto,
      );
    });
  });
});
