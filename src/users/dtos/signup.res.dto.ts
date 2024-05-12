import { Expose, Transform } from 'class-transformer';

export class SignUpResDto {
  @Expose()
  @Transform((value) => value.obj._id.toString())
  _id: any;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  accessToken: string;
}
