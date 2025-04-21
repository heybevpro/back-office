import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OrderService } from '../service/order.service';
import { JwtAuthGuard } from '../../../../guards/auth/jwt.guard';
import { CreateTabDto } from '../dto/create-tab.dto';
import { CreateClosedOrderDto } from '../dto/create-closed-order.dto';

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

  @Get('closed')
  getAllClosedOrders() {
    return this.orderService.getAllClosedOrders();
  }

  @Post('tab')
  createTab(createTabDto: CreateTabDto) {
    return this.orderService.createTab(createTabDto);
  }

  @Post('closed')
  createClosedOrder(createTabDto: CreateClosedOrderDto) {
    return this.orderService.createClosedOrder(createTabDto);
  }
}
