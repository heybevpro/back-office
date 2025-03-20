import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../entity/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findById(@Param('id') id: string): Promise<User> {
    return this.userService.findOneById(id);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }
}
