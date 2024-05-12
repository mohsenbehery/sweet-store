import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern('accepted-orders')
  handleAcceptedOrders(@Payload() data: string) {
    this.appService.acceptedOrders(data);
  }
  @EventPattern('rejected-orders')
  handleRejectedOrders(@Payload() data: string) {
    this.appService.rejectdedOrders(data);
  }
  @EventPattern('fulfilled-orders')
  handleFulfilledOrders(@Payload() data: string) {
    this.appService.fulfilledOrders(data);
  }
}
