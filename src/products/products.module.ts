import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schema/products.model';
import { Order, OrderSchema } from 'src/schema/orders.model';
import { Member, MemberSchema } from 'src/schema/members.model';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/users/authContants';
import { UsersService } from 'src/users/users.service';
import { Baker, BakerSchema } from 'src/schema/bakers.model';

@Module({
  imports: [
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
  controllers: [ProductsController],
  providers: [ProductsService, UsersService],
})
export class ProductsModule {}
