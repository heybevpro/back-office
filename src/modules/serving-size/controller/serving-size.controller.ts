import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ServingSizeService } from '../service/serving-size.service';
import { CreateServingSizeDto } from '../dto/create-serving-size.dto';
import { ServingSize } from '../entity/serving-size.entity';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { AuthorizedRequest } from '../../../utils/constants/auth.constants';

@Controller('serving-size')
@UseGuards(JwtAuthGuard)
export class ServingSizeController {
  constructor(private readonly servingSizeService: ServingSizeService) {}

  @Post()
  async create(
    @Body() createServingSizeDto: CreateServingSizeDto,
  ): Promise<ServingSize> {
    return await this.servingSizeService.create(createServingSizeDto);
  }

  @Get()
  async findByOrganization(
    @Request() request: AuthorizedRequest,
  ): Promise<Array<ServingSize>> {
    return await this.servingSizeService.findAllByOrganization(
      request.user.organization.id,
    );
  }
}
