import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

enum Role {
  Member = 'member',
  Baker = 'baker',
}

export class SignupDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(Role, { message: 'Invalid role' })
  role: Role;
}
