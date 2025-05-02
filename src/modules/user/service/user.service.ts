import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { EntityNotFoundError, Not, Repository } from 'typeorm';
import { UserNotFoundException } from '../../../excpetions/credentials.exception';
import { CreateUserDto } from '../dto/create-user.dto';
import { RoleService } from '../../role/service/role.service';
import { Role } from '../../../utils/constants/role.constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
  ) {}

  async findOneById(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({
        where: { id },
        relations: { role: true },
      });
    } catch (error) {
      throw new NotFoundException('User not found', { cause: error });
    }
  }

  async findOneByIdAndRole(id: string, role: Role): Promise<User> {
    return await this.userRepository.findOneOrFail({
      where: { id: id, role: { role_name: role } },
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
          email_verified: true,
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

  async findAllExceptLoggedInUser(loggedInUserId: string): Promise<User[]> {
    return await this.userRepository.find({
      relations: { role: true },
      select: { role: { id: true, role_name: true } },
      where: { id: Not(loggedInUserId) },
    });
  }

  async markUserEmailAsVerified(email: string): Promise<User> {
    const user = await this.userRepository.findOneOrFail({
      where: { email: email },
    });
    user.email_verified = true;
    return await this.update(user);
  }

  async create(user: CreateUserDto): Promise<User> {
    const defaultRole = await this.roleService.findDefault();
    try {
      return await this.userRepository.save(
        this.userRepository.create({ ...user, role: defaultRole }),
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new ConflictException(
        `User with email: ${user.email} already exists`,
      );
    }
  }

  async updateUserPasswordHash(userId: string, hash: string) {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    user.password = hash;
    return await this.update(user);
  }

  async update(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}
