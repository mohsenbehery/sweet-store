import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Request,
  UseGuards,
  Param,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/createOrder.dto';
import { AuthGuard } from 'src/users/auth.guard';
import { AuthbakerGuard } from 'src/products/auth.baker.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('orders')
@UseInterceptors(CacheInterceptor)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @UseGuards(AuthGuard)
  @Post()
  createOrder(@Body() order: CreateOrderDto, @Request() request: Request) {
    return this.ordersService.createOrder(order, request);
  }
  @UseGuards(AuthGuard)
  @Get()
  getMyOrder(@Request() request: Request) {
    return this.ordersService.getMyOrder(request);
  }
  @UseGuards(AuthbakerGuard)
  @Get('/baker')
  getBakerOrder(@Request() request: Request) {
    return this.ordersService.getBakerOrder(request);
  }
  @UseGuards(AuthGuard)
  @Get('/:id')
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }
  @UseGuards(AuthbakerGuard)
  @Post('/:id/accept')
  acceptOrder(@Param('id') orderId: string) {
    return this.ordersService.acceptOrder(orderId);
  }
  @UseGuards(AuthbakerGuard)
  @Post('/:id/reject')
  rejectOrder(@Param('id') orderId: string) {
    return this.ordersService.rejectOrder(orderId);
  }
  @UseGuards(AuthbakerGuard)
  @Post('/:id/fulfill')
  fulfillOrder(@Param('id') orderId: string) {
    return this.ordersService.fulfillOrder(orderId);
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  deleteOrder(@Param('id') orderId: string, @Request() request: Request) {
    return this.ordersService.deleteOrder(orderId, request);
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  updateOrder(
    @Param('id') orderId: string,
    @Request() request: Request,
    @Body() body: Partial<CreateOrderDto>,
  ) {
    return this.ordersService.updateOrder(orderId, body, request);
  }
}
