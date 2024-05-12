import { Expose, Transform } from 'class-transformer';

export class ProductResDto {
  @Expose()
  @Transform((value) => value.obj._id.toString())
  _id: any;
  @Expose()
  title: string;
  @Expose()
  description: string;
  @Expose()
  price: number;
  @Transform((value) => value.obj.bakerId.toString())
  @Expose()
  bakerId: any;
}
