import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UserService } from '../../user/service/user.service';
import { NotFoundException } from '@nestjs/common';
import { User } from '../../user/entity/user.entity';
import { InvalidUserCredentialsException } from '../../../excpetions/credentials.exception';

import * as bcrypt from 'bcrypt';

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

  const mockUserService = {
    findOneById: jest.fn((id: string) => {
      if (id === 'VALID_ID') return Promise.resolve(mockUser);
      throw new NotFoundException();
    }),
    findOneByEmail: jest.fn((email: string) => {
      if (email === 'VALID_EMAIL') return Promise.resolve(mockUser);
      throw new NotFoundException();
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
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
        service.signIn('INVALID_EMAIL', 'VALID_PASSWORD'),
      ).rejects.toThrow(InvalidUserCredentialsException);
      jest.spyOn(service, 'compareHash');

      expect(mockUserService.findOneByEmail).toHaveBeenCalledTimes(1);
    });

    it('should return an UnauthorizedException when invalid password is submitted', async () => {
      const compareHashSpy = jest.spyOn(service, 'compareHash');
      await expect(
        service.signIn('VALID_EMAIL', 'INVALID_PASSWORD'),
      ).rejects.toThrow(InvalidUserCredentialsException);
      expect(compareHashSpy).toHaveBeenCalledTimes(1);
    });

    it('should compare the password hash with the correct parameters', async () => {
      const compareHashSpy = jest.spyOn(service, 'compareHash');
      await expect(
        service.signIn('VALID_EMAIL', 'INVALID_PASSWORD'),
      ).rejects.toThrow(InvalidUserCredentialsException);
      expect(compareHashSpy).toHaveBeenCalledWith(
        'INVALID_PASSWORD',
        mockUser.password,
      );
    });

    it('should return the user when valid credentials are submitted', async () => {
      jest.mock('bcrypt');

      const compareHashSpy = jest.spyOn(bcrypt, 'compare');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const response = await service.signIn('VALID_EMAIL', 'VALID_PASSWORD');
      expect(response).toEqual(mockUser);
      expect(compareHashSpy).toHaveBeenCalledTimes(1);
      expect(compareHashSpy).toHaveBeenCalledWith(
        'VALID_PASSWORD',
        mockUser.password,
      );
    });
  });
});
