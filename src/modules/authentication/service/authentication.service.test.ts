import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/entity/user.entity';
import {
  InvalidUserCredentialsException,
  UserNotFoundException,
} from '../../../exceptions/credentials.exception';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { Role } from '../../role/entity/role.entity';
import {
  TemporaryAccessJwtPayload,
  VerifiedJwtPayload,
} from '../../../utils/constants/auth.constants';
import { ImATeapotException } from '@nestjs/common';
import { VerificationService } from '../../verification/service/verification.service';
import { Role as RoleLevel } from '../../../utils/constants/role.constants';
import { PasswordResetEmailSentSuccessResponse } from '../../../utils/constants/api-response.constants';
import { Organization } from '../../organization/entity/organization.entity';
import { AccountOnboardingDto } from '../dto/account-onboarding.dto';
import { OrganizationSize } from '../../../utils/constants/organization.constants';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  const mockUser: User = {
    id: 'VALID_ID',
    first_name: 'John',
    last_name: 'Doe',
    password: '<_PASSWORD_>',
    email: 'john@email.com',
    email_verified: true,
    onboarding_complete: true,
    role: { id: 'ROLE_ID', role_name: 'ADMIN' } as unknown as Role,
    created_at: new Date(),
    updated_at: new Date(),
    organization: { id: 1, name: 'VALID_ORGANIZATION_NAME' } as Organization,
  };

  const userByEmailQueryResponse: Omit<User, 'updated_at'> = {
    ...mockUser,
  };

  const sanitizedUserData: Omit<User, 'password' | 'updated_at'> = {
    id: mockUser.id,
    first_name: mockUser.first_name,
    last_name: mockUser.last_name,
    email: mockUser.email,
    email_verified: mockUser.email_verified,
    onboarding_complete: mockUser.onboarding_complete,
    role: mockUser.role.role_name as unknown as Role,
    created_at: mockUser.created_at,
    organization: mockUser.organization,
  };

  const mockUserService = {
    findOneById: jest.fn((id: string) => {
      if (id === 'VALID_ID') return Promise.resolve(sanitizedUserData);
      throw new UserNotFoundException();
    }),
    findOneByEmail: jest.fn((email: string) => {
      if (email === 'VALID_EMAIL') {
        return Promise.resolve(userByEmailQueryResponse);
      }
      throw new UserNotFoundException();
    }),
    create: jest.fn((createUserDto: CreateUserDto) =>
      Promise.resolve({
        id: 'VALID_ID',
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        email: createUserDto.email,
      }),
    ),
    findOneByIdAndRole: jest.fn(),
    updateUserPasswordHash: jest.fn(),
    onboardUser: jest.fn(),
  };

  const mockVerificationService = {
    addEmailVerificationRecord: jest.fn(),
    findPasswordResetRequestByCode: jest.fn(),
    createPasswordResetRequest: jest.fn(),
    deleteEmailVerificationRecordById: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(() => Promise.resolve('VALID_ACCESS_TOKEN')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        { provide: VerificationService, useValue: mockVerificationService },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign in', () => {
    it('should return an UnauthorizedException when invalid password is submitted', async () => {
      const compareHashSpy = jest.spyOn(service, 'compareHash');
      await expect(
        service.validateUser({
          email: 'VALID_EMAIL',
          password: 'INVALID_PASSWORD',
        }),
      ).rejects.toThrow(InvalidUserCredentialsException);
      expect(compareHashSpy).toHaveBeenCalledTimes(1);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should compare the password hash with the correct parameters', async () => {
      const compareHashSpy = jest.spyOn(service, 'compareHash');
      await expect(
        service.validateUser({
          email: 'VALID_EMAIL',
          password: 'INVALID_PASSWORD',
        }),
      ).rejects.toThrow(InvalidUserCredentialsException);
      expect(compareHashSpy).toHaveBeenCalledWith(
        'INVALID_PASSWORD',
        mockUser.password,
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should return the user details & a JWT access_token when valid credentials are submitted', async () => {
      jest.mock('bcrypt');

      const compareHashSpy = jest.spyOn(bcrypt, 'compare');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const response = await service.validateUser({
        email: 'VALID_EMAIL',
        password: 'VALID_PASSWORD',
      });
      expect(response).toEqual({
        access_token: 'VALID_ACCESS_TOKEN',
        ...Object.assign({}, sanitizedUserData),
      });
      expect(compareHashSpy).toHaveBeenCalledTimes(1);
      expect(compareHashSpy).toHaveBeenCalledWith(
        'VALID_PASSWORD',
        mockUser.password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('register', () => {
    const createUserMockData: CreateUserDto = {
      first_name: 'Jane',
      last_name: 'Doe',
      password: '<_PASSWORD_>',
      email: 'newuser@email.com',
    };
    it('should return the created user', async () => {
      expect(await service.register(createUserMockData)).toEqual({
        access_token: 'VALID_ACCESS_TOKEN',
        id: 'VALID_ID',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'newuser@email.com',
      });
      expect(
        mockVerificationService.addEmailVerificationRecord,
      ).toHaveBeenCalledWith({ email: createUserMockData.email });
    });
  });

  describe('validateUserJwt', () => {
    const mockJwtPayload: VerifiedJwtPayload = {
      id: '<_VALID-ID_>',
      first_name: '<_FIRST-NAME_>',
      last_name: '<_LAST-NAME_>',
      email: '<_EMAIL_>',
      role: {
        id: '<_ROLE_ID>',
        role_name: RoleLevel.GUEST,
        created_at: new Date(),
        updated_at: new Date(),
      },
      exp: 10000,
      iat: 9999,
    };
    it('should validate the JWT Payload', async () => {
      await service.validateUserJwt(mockJwtPayload);
      expect(mockUserService.findOneByIdAndRole).toHaveBeenCalledWith(
        mockJwtPayload.id,
        mockJwtPayload.role.role_name,
      );
    });
    it('should throw and exception if JWT payload is invalid', async () => {
      const userServiceSpy = jest.spyOn(mockUserService, 'findOneByIdAndRole');
      userServiceSpy.mockRejectedValue(new ImATeapotException());
      await expect(service.validateUserJwt(mockJwtPayload)).rejects.toThrow(
        InvalidUserCredentialsException,
      );
    });
  });

  describe('validateTemporaryAccessJwt', () => {
    const mockTemporaryAccessJwtPayload: TemporaryAccessJwtPayload = {
      id: 'VALID_ID',
      email: 'VALID_EMAIL@PROVIDER',
      exp: 10000,
      iat: 9999,
    };
    it('should return the user details & a temporary JWT access_token', async () => {
      const response = await service.validateTemporaryAccessJwt(
        mockTemporaryAccessJwtPayload,
      );
      expect(mockUserService.findOneById).toHaveBeenCalledWith(
        mockTemporaryAccessJwtPayload.id,
      );
      expect(response).toEqual(sanitizedUserData);
    });

    it('should throw and exception if JWT payload is invalid', async () => {
      const userServiceSpy = jest.spyOn(mockUserService, 'findOneById');
      userServiceSpy.mockRejectedValue(new ImATeapotException());
      await expect(
        service.validateTemporaryAccessJwt(mockTemporaryAccessJwtPayload),
      ).rejects.toThrow(InvalidUserCredentialsException);
    });
  });

  describe('validate reset password request', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a reset token when the code is valid', async () => {
      const mockCode = 'VALID_CODE';
      const mockVerificationRecord = { email: 'user@example.com' };
      const mockResetToken = 'RESET_TOKEN';

      jest
        .spyOn(mockVerificationService, 'findPasswordResetRequestByCode')
        .mockResolvedValue(mockVerificationRecord);
      jest.spyOn(mockUserService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue(mockResetToken);

      const result = await service.validateResetPassword(mockCode);

      expect(
        mockVerificationService.findPasswordResetRequestByCode,
      ).toHaveBeenCalledWith(mockCode);
      expect(mockUserService.findOneByEmail).toHaveBeenCalledWith(
        mockVerificationRecord.email,
      );

      expect(result).toEqual({ reset_token: mockResetToken });
    });

    it('should generate the JWT token with the correct payload', async () => {
      const mockCode = 'VALID_CODE';
      const mockVerificationRecord = { email: 'user@example.com' };
      const mockResetToken = 'RESET_TOKEN';

      jest
        .spyOn(mockVerificationService, 'findPasswordResetRequestByCode')
        .mockResolvedValue(mockVerificationRecord);
      jest.spyOn(mockUserService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue(mockResetToken);

      await service.validateResetPassword(mockCode);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email },
        { expiresIn: '10m' },
      );
    });

    it('should throw an exception when the code is invalid', async () => {
      const mockCode = 'INVALID_CODE';

      jest
        .spyOn(mockVerificationService, 'findPasswordResetRequestByCode')
        .mockRejectedValue(new Error('Invalid code'));

      await expect(service.validateResetPassword(mockCode)).rejects.toThrow(
        Error,
      );

      expect(
        mockVerificationService.findPasswordResetRequestByCode,
      ).toHaveBeenCalledWith(mockCode);
      expect(mockUserService.findOneByEmail).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw an exception when the user is not found', async () => {
      const mockCode = 'VALID_CODE';
      const mockVerificationRecord = { email: 'user@example.com' };

      jest
        .spyOn(mockVerificationService, 'findPasswordResetRequestByCode')
        .mockResolvedValue(mockVerificationRecord);
      jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockRejectedValue(new InvalidUserCredentialsException());

      await expect(service.validateResetPassword(mockCode)).rejects.toThrow(
        InvalidUserCredentialsException,
      );

      expect(
        mockVerificationService.findPasswordResetRequestByCode,
      ).toHaveBeenCalledWith(mockCode);
      expect(mockUserService.findOneByEmail).toHaveBeenCalledWith(
        mockVerificationRecord.email,
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should hash the password and update the user password hash', async () => {
      const userId = 'VALID_USER_ID';
      const updatedPassword = 'NEW_PASSWORD';
      const hashedPassword = 'HASHED_PASSWORD';
      jest.mock('bcrypt');
      const hashTextSpy = jest.spyOn(bcrypt, 'hash');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      jest
        .spyOn(mockUserService, 'updateUserPasswordHash')
        .mockResolvedValue(true);

      const result = await service.resetPassword(userId, updatedPassword);

      expect(hashTextSpy).toHaveBeenCalledWith(updatedPassword, 13);
      expect(mockUserService.updateUserPasswordHash).toHaveBeenCalledWith(
        userId,
        hashedPassword,
      );
      expect(result).toBe(true);
    });

    it('should throw an error if updating the password hash fails', async () => {
      const userId = 'VALID_USER_ID';
      const updatedPassword = 'NEW_PASSWORD';

      jest.mock('bcrypt');
      const hashTextSpy = jest.spyOn(bcrypt, 'hash');
      (bcrypt.hash as jest.Mock).mockResolvedValue('HASHED_PASSWORD');
      jest
        .spyOn(mockUserService, 'updateUserPasswordHash')
        .mockRejectedValue(new Error('Update failed'));

      await expect(
        service.resetPassword(userId, updatedPassword),
      ).rejects.toThrow('Update failed');

      expect(hashTextSpy).toHaveBeenCalled();
      expect(mockUserService.updateUserPasswordHash).toHaveBeenCalled();
    });
  });

  describe('requestResetPassword', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should create a password reset request successfully', async () => {
      const email = 'john@email.com';

      jest
        .spyOn(mockVerificationService, 'createPasswordResetRequest')
        .mockResolvedValue(PasswordResetEmailSentSuccessResponse);

      jest.spyOn(mockUserService, 'findOneByEmail').mockResolvedValue(mockUser);

      const result = await service.requestResetPassword(email);

      expect(
        mockVerificationService.createPasswordResetRequest,
      ).toHaveBeenCalledWith(email);
      expect(result).toEqual(PasswordResetEmailSentSuccessResponse);
    });

    it('should throw an error if creating a password reset request fails', async () => {
      const email = 'user@example.com';

      jest
        .spyOn(mockVerificationService, 'createPasswordResetRequest')
        .mockRejectedValue(new Error('Request failed'));

      await expect(service.requestResetPassword(email)).rejects.toThrow(
        'Request failed',
      );

      expect(
        mockVerificationService.createPasswordResetRequest,
      ).toHaveBeenCalledWith(email);
    });

    it('should return a success response even if the email is invalid', async () => {
      const email = 'invalid@user.com';

      jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockRejectedValue(new ImATeapotException());

      jest
        .spyOn(mockVerificationService, 'createPasswordResetRequest')
        .mockRejectedValue(new Error('Request failed'));

      const result = await service.requestResetPassword(email);

      expect(
        mockVerificationService.createPasswordResetRequest,
      ).not.toHaveBeenCalled();
      expect(result).toEqual(PasswordResetEmailSentSuccessResponse);
    });
  });

  describe('onboard', () => {
    it('should make a cal to the onboard user method in user service', async () => {
      const userId = 'VALID_USER_ID';
      const onboardingDto: AccountOnboardingDto = {
        name: 'Organization Name',
        phone: '123-456-7890',
        address_line1: '123 Main St',
        address_line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        size: OrganizationSize.SMALL,
      };
      await service.onboard(userId, onboardingDto);

      expect(mockUserService.onboardUser).toHaveBeenCalledWith(
        userId,
        onboardingDto,
      );
    });
  });
});
