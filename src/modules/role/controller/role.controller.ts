import {
  Body,
  Controller,
  Put,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from '../service/role.service';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { DatabaseClientExceptionFilter } from '../../../filters/database-client-expection.filter';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(JwtAuthGuard)
  @UseFilters(DatabaseClientExceptionFilter)
  @Put('update')
  update(
    @Request() request: { user: { id: string } },
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(request.user.id, updateRoleDto);
  }
}
