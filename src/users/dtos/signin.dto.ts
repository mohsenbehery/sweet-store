import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
