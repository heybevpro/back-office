import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../entity/user.entity';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findById(@Param('id') id: string): Promise<User> {
    return this.userService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/admin/all')
  async findAllExceptLoggedInUser(
    @Request() request: { user: { id: string } },
  ): Promise<Array<User>> {
    return this.userService.findAllExceptLoggedInUser(request.user.id);
  }
}
