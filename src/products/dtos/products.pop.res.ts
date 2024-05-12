import { Expose, Transform } from 'class-transformer';

export class ProductPopResDto {
  @Expose()
  @Transform((value) => value.obj._id.toString())
  _id: any;
  @Expose()
  title: string;
  @Expose()
  description: string;
  @Expose()
  price: number;
  @Expose({ name: 'baker' })
  @Transform(({ obj }) => {
    const bakerId = obj.bakerId;
    return {
      _id: bakerId._id.toString(),
      name: bakerId.name,
    };
  })
  baker: any;
}
