import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MemberDocument = Member & Document;

@Schema()
export class Member {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: 'member' })
  role: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Order' }] })
  myOrders: string[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
