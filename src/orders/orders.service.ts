import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from 'src/schema/orders.model';
import { ProductsService } from 'src/products/products.service';
import { Baker } from 'src/schema/bakers.model';
import { Member } from 'src/schema/members.model';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Baker.name) private bakerModel: Model<Baker>,
    @InjectModel(Member.name) private memberModel: Model<Member>,
    private productsService: ProductsService,
    @Inject('MATH_SERVICE') private rabbitClient: ClientProxy,
  ) {}

  async createOrder(order: any, request: any) {
    const { quantity, productId } = order;

    const product = await this.productsService.getProductById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const bakerId = product.bakerId;
    const userId = request['user'].id;

    const baker = await this.bakerModel.findById(bakerId);
    const user = await this.memberModel.findById(userId);

    const productPrice = product.price;
    const totalPrice = Number((quantity * productPrice).toFixed(2));

    let existingOrder = await this.orderModel.findOne({
      userId,
      bakerId,
      status: { $ne: 'Accepted' },
    });

    if (existingOrder) {
      const existingProductIndex = existingOrder.products.findIndex(
        (prod) => prod.productId.toString() === productId.toString(),
      );
      if (existingProductIndex !== -1) {
        existingOrder.products[existingProductIndex].quantity += quantity;
        existingOrder.totalPrice += totalPrice;
        await existingOrder.save();

        return (
          await existingOrder.populate({ path: 'bakerId', select: 'name' })
        ).populate({
          path: 'products.productId',
          select: 'title description price',
        });
      } else {
        existingOrder.products.push({ productId, quantity });
        existingOrder.totalPrice += totalPrice;
        await existingOrder.save();

        return (
          await existingOrder.populate({ path: 'bakerId', select: 'name' })
        ).populate({
          path: 'products.productId',
          select: 'title description price',
        });
      }
    }

    const newOrder = await this.orderModel.create({
      userId,
      bakerId,
      totalPrice,
      products: [{ productId, quantity }],
    });

    baker.currentOrders.push(newOrder._id.toString());
    await baker.save();

    user.myOrders.push(newOrder._id.toString());
    await user.save();

    return (
      await newOrder.populate({ path: 'bakerId', select: 'name' })
    ).populate({
      path: 'products.productId',
      select: 'title description price',
    });
  }

  async getOrderById(id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getMyOrder(request: any) {
    const userId = request.user.id;
    const user = await this.memberModel.findById(userId).populate('myOrders');
    return user.myOrders;
  }

  async getBakerOrder(request: any) {
    const userId = request['user'].id;
    const baker = await this.bakerModel
      .findById(userId)
      .populate('currentOrders');
    return baker.currentOrders;
  }

  async acceptOrder(orderId: string) {
    const order = await this.getOrderById(orderId);
    order.status = 'Accepted';
    await order.save();
    const user = await this.memberModel.findById(order.userId);
    await this.rabbitClient.emit('accepted-orders', {
      email: user.email,
      name: user.name,
    });
    return { message: 'order accepted' };
  }
  async rejectOrder(orderId: string) {
    const order = await this.getOrderById(orderId);
    order.status = 'Rejected';
    await order.save();
    const user = await this.memberModel.findById(order.userId);
    await this.rabbitClient.emit('rejected-orders', {
      email: user.email,
      name: user.name,
    });
    return { message: 'order rejected' };
  }
  async fulfillOrder(orderId: string) {
    const order = await this.getOrderById(orderId);
    order.status = 'Fulfilled';
    await order.save();
    const user = await this.memberModel.findById(order.userId);
    await this.rabbitClient.emit('fulfilled-orders', {
      email: user.email,
      name: user.name,
    });
    return { message: 'order fulfilled' };
  }
  async deleteOrder(orderId: string, req: any) {
    const order = await this.getOrderById(orderId);
    const isOwner = req.user.id === order.userId.toString();

    if (!isOwner) {
      throw new UnauthorizedException(
        'You are not authorized to delete this order.',
      );
    }

    if (order.status === 'Accepted') {
      throw new BadRequestException(
        'You cannot delete an order that has been accepted.',
      );
    }

    const baker = await this.bakerModel.findById(order.bakerId);
    const bakerIndex = baker.currentOrders.indexOf(orderId);
    if (bakerIndex !== -1) {
      baker.currentOrders.splice(bakerIndex, 1);
      await baker.save();
    }

    const user = await this.memberModel.findById(order.userId);
    const userIndex = user.myOrders.indexOf(orderId);
    if (userIndex !== -1) {
      user.myOrders.splice(userIndex, 1);
      await user.save();
    }

    await order.deleteOne();
  }
  async updateOrder(orderId: string, updateData: any, req: any) {
    const order = await this.getOrderById(orderId);

    const isOwner = req.user.id === order.userId.toString();

    if (!isOwner) {
      throw new UnauthorizedException(
        'You are not authorized to update this order.',
      );
    }

    if (order.status === 'Accepted') {
      throw new BadRequestException(
        'You cannot update an order that has been accepted.',
      );
    }

    const { productId, quantity } = updateData;

    if (productId && quantity !== undefined) {
      const productIdToUpdateString = productId.toString(); // Convert ObjectId to string

      const productToUpdate = order.products.find(
        (product) => product.productId.toString() === productIdToUpdateString,
      );

      if (!productToUpdate) {
        throw new NotFoundException('Product not found in order.');
      }

      const product = await this.productsService.getProductById(productId);

      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      productToUpdate.quantity = quantity;

      const totalPrice = order.products.reduce(
        (acc, curr) => acc + curr.quantity * product.price,
        0,
      );

      order.totalPrice = Number(totalPrice.toFixed(2));
    }

    await order.save();

    return order;
  }
  handleReceivedOrders(data) {
    console.log('here is the messages from rabbitMQ' + `${data.message}`);
  }
}
