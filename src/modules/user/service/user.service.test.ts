import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userRepository: Repository<User>;
  let service: UserService;

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
      const user: User = {
        id: '<_USER_ID_>',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@email.com',
        password: '<_PASSWORD_>',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(user);
      expect(await service.findOneById('<_ID_>')).toEqual(user);
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

  describe('find user by email and password', () => {
    it('should return the user if found', async () => {
      const user: User = {
        id: '<_USER_ID_>',
        first_name: 'John',
        last_name: 'Doe',
        email: '<_EMAIL_>',
        password: '<_PASSWORD_>',
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(user);
      expect(await service.findOneByEmail('<_EMAIL_>')).toEqual(user);
    });

    it('should throw a Not Found Exception if user is not found', async () => {
      jest
        .spyOn(userRepository, 'findOneOrFail')
        .mockRejectedValue(new NotFoundException());
      await expect(
        service.findOneByEmail('<_INVALID-CREDENTIALS_>'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
