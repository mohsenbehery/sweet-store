import { IsNotEmpty } from 'class-validator';

export class ProductsDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  price: number;
}
