import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../entity/role.entity';
import { Repository } from 'typeorm';
import { Role as RoleLevel } from '../../../utils/constants/role.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async findDefault(): Promise<Role> {
    return this.roleRepository.findOneOrFail({
      where: { role_name: RoleLevel.GUEST },
    });
  }

  async update(userId: string, updateRoleDto: UpdateRoleDto): Promise<User> {
    const currentUser = await this.userService.findOneById(userId);
    console.log(currentUser);
    if (
      currentUser.role.role_name === RoleLevel.GUEST ||
      currentUser.role.role_name === RoleLevel.MANAGER ||
      (currentUser.role.role_name === RoleLevel.ADMIN &&
        updateRoleDto.role === RoleLevel.SUPER_ADMIN)
    ) {
      throw new UnauthorizedException('Missing permissions to update role');
    }
    try {
      const userToUpdate = await this.userService.findOneById(
        updateRoleDto.user,
      );
      userToUpdate.role = await this.roleRepository.findOneOrFail({
        where: { role_name: updateRoleDto.role },
      });
      return await this.userService.update(userToUpdate);
    } catch (error: unknown) {
      console.error(error);
      throw new BadRequestException('Invalid User');
    }
  }
}
