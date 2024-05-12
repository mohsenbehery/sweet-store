import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Member } from 'src/schema/members.model';
import { Baker } from 'src/schema/bakers.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SignupDto } from './dtos/signup.dto';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<Member>,
    @InjectModel(Baker.name) private bakerModel: Model<Baker>,
  ) {}

  async createUser(user: SignupDto) {
    let newUser;
    if (user.role === 'member') {
      newUser = await this.memberModel.create(user);
    } else if (user.role === 'baker') {
      newUser = await this.bakerModel.create(user);
    } else {
      throw new BadRequestException('Invalid role');
    }
    await newUser.save();
    return newUser;
  }

  async getUserById(id: string) {
    let user = await this.memberModel.findById(id);
    if (!user) {
      user = await this.bakerModel.findById(id);
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async findUser(email: string) {
    const memberUsers = await this.memberModel.find({ email });
    const bakerUsers = await this.bakerModel.find({ email });
    return [...memberUsers, ...bakerUsers];
  }

  async getAllUsers() {
    const memberUsers = await this.memberModel.find();
    const bakerUsers = await this.bakerModel.find();
    return [...memberUsers, ...bakerUsers];
  }
  async update(id: string, attrs: Partial<Member>, request) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!request['user'].id === user.id) {
      throw new BadRequestException('You Are Not Allowed To');
    }

    const UserModel = this.getModelByRole(user.role);
    const updatedUser = { ...user.toObject(), ...attrs };

    const result = await UserModel.findByIdAndUpdate(id, updatedUser, {
      new: true,
    });
    return result;
  }

  async remove(id: string, request) {
    const user = await this.getUserById(id);

    if (request['user'].id !== user.id.toString()) {
      throw new BadRequestException('You are not allowed to delete this user');
    }

    const UserModel = this.getModelByRole(user.role);
    return UserModel.deleteOne({ _id: id });
  }

  async resrtPassword(
    id: string,
    password: string,
    newPassword: string,
    request,
  ) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (!request['user'].id === user.id) {
      throw new BadRequestException('You Are Not Allowed To');
    }
    const salt = await randomBytes(8).toString('hex');
    const hash = (await scrypt(newPassword, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');
    const updatedUser = { ...user.toObject(), password: result };

    const UserModel = this.getModelByRole(user.role);
    const finalResult = await UserModel.findByIdAndUpdate(id, updatedUser, {
      new: true,
    });

    return finalResult;
  }

  private getModelByRole(role: string): Model<Member | Baker> {
    if (role === 'member') {
      return this.memberModel;
    } else if (role === 'baker') {
      return this.bakerModel;
    } else {
      throw new BadRequestException('Invalid role');
    }
  }
}
