import { Expose } from 'class-transformer';

export class SignInResDto {
  @Expose()
  accessToken: string;
}
