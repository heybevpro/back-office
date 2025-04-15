import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/entity/user.entity';
import {
  InvalidJwtException,
  InvalidUserCredentialsException,
  UserNotFoundException,
} from '../../../excpetions/credentials.exception';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { Role } from '../../role/entity/role.entity';
import { VerifiedJwtPayload } from '../../../utils/constants/auth.constants';
import { ImATeapotException } from '@nestjs/common';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  const mockUser: User = {
    id: 'VALID_ID',
    first_name: 'John',
    last_name: 'Doe',
    password: '<_PASSWORD_>',
    email: 'john@email.com',
    role: { id: 'ROLE_ID', role_name: 'ADMIN' } as unknown as Role,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userByEmailQueryResponse: Omit<User, 'updated_at'> = {
    ...mockUser,
  };

  const sanitizedUserData: Omit<User, 'password' | 'updated_at'> = {
    id: mockUser.id,
    first_name: mockUser.first_name,
    last_name: mockUser.last_name,
    email: mockUser.email,
    role: mockUser.role.role_name as unknown as Role,
    created_at: mockUser.created_at,
  };

  const mockUserService = {
    findOneById: jest.fn((id: string) => {
      if (id === 'VALID_ID') return Promise.resolve(sanitizedUserData);
      throw new UserNotFoundException();
    }),
    findOneByEmail: jest.fn((email: string) => {
      if (email === 'VALID_EMAIL')
        return Promise.resolve(userByEmailQueryResponse);
      throw new UserNotFoundException();
    }),
    create: jest.fn((createUserDto: CreateUserDto) =>
      Promise.resolve({
        id: '<_AUTO_UUID_>',
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        email: createUserDto.email,
      }),
    ),
    findOneByIdAndRole: jest.fn(),
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
        ...sanitizedUserData,
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
        id: '<_AUTO_UUID_>',
        first_name: createUserMockData.first_name,
        last_name: createUserMockData.last_name,
        email: createUserMockData.email,
      });
    });
  });

  describe('validateUserJwt', () => {
    const mockJwtPayload: VerifiedJwtPayload = {
      id: '<_VALID-ID_>',
      first_name: '<_FIRST-NAME_>',
      last_name: '<_LAST-NAME_>',
      email: '<_EMAIL_>',
      role: 'ADMIN',
      exp: 10000,
      iat: 9999,
    };
    it('should validate the JWT Payload', async () => {
      await service.validateUserJwt(mockJwtPayload);
      expect(mockUserService.findOneByIdAndRole).toHaveBeenCalledWith(
        mockJwtPayload.id,
        mockJwtPayload.role,
      );
    });
    it('should throw and exception if JWT payload is invalid', async () => {
      const userServiceSpy = jest.spyOn(mockUserService, 'findOneByIdAndRole');
      userServiceSpy.mockRejectedValue(new ImATeapotException());
      await expect(service.validateUserJwt(mockJwtPayload)).rejects.toThrow(
        InvalidJwtException,
      );
    });
  });
});
