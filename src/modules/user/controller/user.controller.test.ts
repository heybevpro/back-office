import { UserController } from './user.controller';
import { UserService } from '../service/user.service';
import { User } from '../entity/user.entity';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../../role/entity/role.entity';

describe('UserController', () => {
  let controller: UserController;
  const mockUser: User = {
    id: 'VALID_ID',
    first_name: 'John',
    last_name: 'Doe',
    password: '<_PASSWORD_>',
    email: 'john@email.com',
    role: 'ADMIN' as unknown as Role,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUserService = {
    findOneById: jest.fn((id: string) => {
      if (id === 'VALID_ID') return Promise.resolve(mockUser);
      throw new NotFoundException();
    }),
    findAll: jest.fn(() => Promise.resolve([mockUser])),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find user by ID', () => {
    it('should return the user if found', async () => {
      expect(await controller.findById('VALID_ID')).toEqual(mockUser);
      expect(mockUserService.findOneById).toHaveBeenCalledTimes(1);
      expect(mockUserService.findOneById).toHaveBeenCalledWith('VALID_ID');
    });
    it('should throw a NotFoundException if user us not found', async () => {
      await expect(controller.findById('INVALID_ID')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserService.findOneById).toHaveBeenCalledWith('INVALID_ID');
    });
  });

  describe('find all users', () => {
    it('should return all users', async () => {
      expect(await controller.findAll()).toEqual([mockUser]);
      expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
