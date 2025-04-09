import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { UserNotFoundException } from '../../../excpetions/credentials.exception';
import { CreateUserDto } from '../dto/create-user.dto';
import { instanceToPlain } from 'class-transformer';
import { RoleService } from '../../role/service/role.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
  ) {}

  async findOneById(id: string): Promise<User> {
    return this.userRepository.findOneOrFail({
      where: { id },
      relations: { role: true },
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({
        relations: { role: true },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          role: { id: true, role_name: true },
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
    return await this.userRepository.find({
      relations: { role: true },
      select: { role: { id: true, role_name: true } },
      order: { created_at: 'DESC' },
    });
  }

  async create(user: CreateUserDto): Promise<User> {
    const defaultRole = await this.roleService.findDefault();
    return instanceToPlain(
      await this.userRepository.save(
        this.userRepository.create({ ...user, role: defaultRole }),
      ),
    ) as User;
  }

  async update(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}
