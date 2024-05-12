import { UsersService } from './users.service';
import { SignupDto } from './dtos/signup.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(
    private userSerivce: UsersService,
    private jwtService: JwtService,
  ) {}
  async signUp(user: SignupDto) {
    const oldUser = await this.userSerivce.findUser(user.email);
    if (oldUser.length) {
      throw new BadRequestException('Email is already in use');
    }
    const salt = await randomBytes(8).toString('hex');
    const hash = (await scrypt(user.password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    user.password = result;
    const newUser = await this.userSerivce.createUser(user);
    return newUser;
  }
  async signIn(email: string, password: string) {
    const user = await this.userSerivce.findUser(email);
    if (!user.length) {
      throw new BadRequestException('Invalid email');
    }
    const [salt, hash] = user[0].password.split('.');
    const newHash = (await scrypt(password, salt, 32)) as Buffer;
    if (newHash.toString('hex') !== hash) {
      throw new BadRequestException('Invalid password');
    }
    const payload = {
      id: user[0]._id,
      username: user[0].name,
      role: user[0].role,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
  async logout(token: string) {
    const { exp } = this.jwtService.decode(token);
    const invalidatedToken = this.jwtService.sign(
      {},
      { expiresIn: exp - Math.floor(Date.now() / 1000) },
    );
  }
}
