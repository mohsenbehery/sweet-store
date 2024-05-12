import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  async acceptedOrders(data: any) {
    console.log(
      `sending message to ${data.email} :' hi m.${data.name} your order has been accepted`,
    );
  }
  async rejectdedOrders(data: any) {
    console.log(
      `sending message to ${data.email} :' hi m.${data.name} your order has been rejected`,
    );
  }
  async fulfilledOrders(data: any) {
    console.log(
      `sending message to ${data.email} :' hi m.${data.name} your order has been fulfilled`,
    );
  }
}
