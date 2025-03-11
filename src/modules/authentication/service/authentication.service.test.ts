import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/entity/user.entity';
import {
  InvalidUserCredentialsException,
  UserNotFoundException,
} from '../../../excpetions/credentials.exception';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  const mockUser: User = {
    id: 'VALID_ID',
    first_name: 'John',
    last_name: 'Doe',
    password: '<_PASSWORD_>',
    email: 'john@email.com',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const sanitizedUserData = {
    id: mockUser.id,
    first_name: mockUser.first_name,
    last_name: mockUser.last_name,
    email: mockUser.email,
    created_at: mockUser.created_at,
  };

  const mockUserService = {
    findOneById: jest.fn((id: string) => {
      if (id === 'VALID_ID') return Promise.resolve(mockUser);
      throw new UserNotFoundException();
    }),
    findOneByEmail: jest.fn((email: string) => {
      if (email === 'VALID_EMAIL') return Promise.resolve(mockUser);
      throw new UserNotFoundException();
    }),
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
    it('should return an UnauthorizedException when invalid email is submitted', async () => {
      await expect(
        service.signIn({ email: 'INVALID_EMAIL', password: 'VALID_PASSWORD' }),
      ).rejects.toThrow(InvalidUserCredentialsException);
      jest.spyOn(service, 'compareHash');

      expect(mockUserService.findOneByEmail).toHaveBeenCalledTimes(1);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should return an UnauthorizedException when invalid password is submitted', async () => {
      const compareHashSpy = jest.spyOn(service, 'compareHash');
      await expect(
        service.signIn({ email: 'VALID_EMAIL', password: 'INVALID_PASSWORD' }),
      ).rejects.toThrow(InvalidUserCredentialsException);
      expect(compareHashSpy).toHaveBeenCalledTimes(1);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should compare the password hash with the correct parameters', async () => {
      const compareHashSpy = jest.spyOn(service, 'compareHash');
      await expect(
        service.signIn({ email: 'VALID_EMAIL', password: 'INVALID_PASSWORD' }),
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
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const response = await service.signIn({
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
});
