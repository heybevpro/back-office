import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { UserNotFoundException } from '../../../excpetions/credentials.exception';
import { CreateUserDto } from '../dto/create-user.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findOneById(id: string): Promise<User> {
    return this.userRepository.findOneOrFail({ where: { id } });
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
          password: true,
        },
        where: { email },
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new UserNotFoundException();
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async create(user: CreateUserDto): Promise<User> {
    return instanceToPlain(
      await this.userRepository.save(this.userRepository.create(user)),
    ) as User;
  }
}
