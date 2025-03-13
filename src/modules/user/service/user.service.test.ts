import { EntityNotFoundError, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { ImATeapotException, NotFoundException } from '@nestjs/common';
import { UserNotFoundException } from '../../../excpetions/credentials.exception';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UserService', () => {
  let userRepository: Repository<User>;
  let service: UserService;
  const mockUser: User = {
    id: '<_USER_ID_>',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@email.com',
    password: '<_PASSWORD_>',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateUserDto: CreateUserDto = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
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
    it('should return the user if found', async () => {
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(mockUser);
      expect(await service.findOneById('<_ID_>')).toEqual(mockUser);
    });

    it('should throw a Not Found Exception if user is not found', async () => {
      jest
        .spyOn(userRepository, 'findOneOrFail')
        .mockRejectedValue(new NotFoundException());

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
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserSpy = jest.spyOn(userRepository, 'create');
      const saveUserSpy = jest.spyOn(userRepository, 'save');
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await service.create(mockCreateUserDto);
      expect(result).toEqual(mockUser);
      expect(createUserSpy).toHaveBeenCalledWith(mockCreateUserDto);
      expect(saveUserSpy).toHaveBeenCalledWith(mockUser);
    });
  });
});
