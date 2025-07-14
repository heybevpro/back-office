import {
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
import { CreateClosedOrderDto } from '../dto/create-closed-order.dto';
import { UpdateTabDto } from '../dto/update-tab.dto';

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
    return this.orderService.createTab(createTabDto);
  }

  @Patch('close/tab/:id')
  closeTab(@Param('id') id: string) {
    return this.orderService.closeTab(id);
  }

  @Post('closed')
  createClosedOrder(@Body() createTabDto: CreateClosedOrderDto) {
    return this.orderService.createClosedOrder(createTabDto);
  }

  @Patch('update/tab/:id')
  updateTabDetails(
    @Param('id') id: string,
    @Body() updateTabDto: UpdateTabDto,
  ) {
    return this.orderService.updateTabDetails(id, updateTabDto);
  }
}
