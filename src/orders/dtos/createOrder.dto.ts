import { IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  quantity: number;
  @IsNotEmpty()
  productId: string;
}
