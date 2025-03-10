import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findOneById(id: string): Promise<User> {
    return this.userRepository.findOneOrFail({ where: { id } });
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOneOrFail({ where: { email } });
  }
}
