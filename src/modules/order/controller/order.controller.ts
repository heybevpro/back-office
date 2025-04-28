import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from '../service/order.service';
import { JwtAuthGuard } from '../../../guards/auth/jwt.guard';
import { CreateTabDto } from '../dto/create-tab.dto';
import { CloseTabDto } from '../dto/close-tab.dto';
import { validateSync } from 'class-validator';

@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Get(':id')
  getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Get('all/closed')
  getAllClosedOrders() {
    return this.orderService.getAllClosedOrders();
  }

  @Post('tab')
  createTab(@Body() createTabDto: CreateTabDto) {
    console.log('CREATE', createTabDto);
    return this.orderService.createTab(createTabDto);
  }

  @Patch('close/tab/:id')
  closeTab(@Param('id') id: string) {
    const closeTabDto = new CloseTabDto(id);
    const err = validateSync(closeTabDto);
    if (err.length > 0) {
      throw new BadRequestException('Bad Request', {
        cause: err,
        description: err.toString(),
      });
    }
    return this.orderService.closeTab(id);
  }

  @Post('closed')
  createClosedOrder(@Body() createTabDto: any) {
    console.log('CREATE CLOSED ORDER', createTabDto);
    return this.orderService.createClosedOrder(createTabDto);
  }
}
