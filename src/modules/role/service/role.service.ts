import { Injectable } from '@nestjs/common';
import { Role } from '../entity/role.entity';
import { Repository } from 'typeorm';
import { Role as RoleLevel } from '../../../utils/constants/role.constants';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async findDefault(): Promise<Role> {
    return this.roleRepository.findOneOrFail({
      where: { role_name: RoleLevel.GUEST },
    });
  }
}
