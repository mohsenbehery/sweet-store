import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schema/products.model';
import { Order, OrderSchema } from 'src/schema/orders.model';

import { Member, MemberSchema } from 'src/schema/members.model';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/users/authContants';
import { Baker, BakerSchema } from 'src/schema/bakers.model';
import { ProductsService } from 'src/products/products.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'orders_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: Member.name,
        schema: MemberSchema,
      },
      {
        name: Baker.name,
        schema: BakerSchema,
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, ProductsService],
})
export class OrdersModule {}
