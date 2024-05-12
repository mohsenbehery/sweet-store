import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BakerDocument = Baker & Document;

@Schema()
export class Baker {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: 'baker' })
  role: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Product' }] })
  myProducts: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Order' }] })
  currentOrders: string[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const BakerSchema = SchemaFactory.createForClass(Baker);
