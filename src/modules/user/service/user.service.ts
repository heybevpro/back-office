import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { UserNotFoundException } from '../../../excpetions/credentials.exception';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findOneById(id: string): Promise<User> {
    return this.userRepository.findOneOrFail({ where: { id } });
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository
      .findOneOrFail({ where: { email } })
      .catch((error: unknown) => {
        if (error instanceof EntityNotFoundError) {
          throw new UserNotFoundException();
        }
        throw error;
      });
  }
}
