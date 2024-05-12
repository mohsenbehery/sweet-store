import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({
    type: [
      {
        productId: { type: MongooseSchema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
      },
    ],
    default: [],
  })
  products: { productId: string; quantity: number }[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Member' })
  userId: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ default: 0 })
  totalPrice: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Baker' })
  bakerId: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
