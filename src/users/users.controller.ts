import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Headers,
  UseInterceptors,
} from '@nestjs/common';
import { Serialize } from '../interceptors/serializeInterceptor';
import { SignUpResDto } from './dtos/signup.res.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { SignInDto } from './dtos/signin.dto';
import { Member } from 'src/schema/members.model';
import { AuthGuard } from './auth.guard';
import { SignInResDto } from './dtos/signin.res.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}
  @Serialize(SignUpResDto)
  @Post('/signup')
  async signUp(@Body() user: SignupDto) {
    return await this.authService.signUp(user);
  }
  @Serialize(SignInResDto)
  @Post('/signin')
  async signIn(@Body() body: SignInDto) {
    return await this.authService.signIn(body.email, body.password);
  }
  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader.split(' ')[1];
    await this.authService.logout(token);
    return { message: 'Logout successful' };
  }
  @Serialize(SignUpResDto)
  @Get()
  @UseGuards(AuthGuard)
  async listUsers(@Request() req: any) {
    return await this.usersService.getAllUsers();
  }
  @Serialize(SignUpResDto)
  @UseGuards(AuthGuard)
  @Get('/:id')
  async getUser(@Param('id') id: string) {
    return await this.usersService.getUserById(id);
  }
  @Serialize(SignUpResDto)
  @UseGuards(AuthGuard)
  @Patch('/:id/update')
  async updateUser(
    @Param('id') id: string,
    @Body() attrs: Partial<Member>,
    @Request() request: Request,
  ) {
    return await this.usersService.update(id, attrs, request);
  }
  @Serialize(SignUpResDto)
  @UseGuards(AuthGuard)
  @Patch('/:id/resetPassword')
  async resetPassword(
    @Param('id') id: string,
    @Body('password') password: string,
    @Body('newPassword') newPassword: string,
    @Request() request: Request,
  ) {
    return await this.usersService.resrtPassword(
      id,
      password,
      newPassword,
      request,
    );
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteUser(@Param('id') id: string, @Request() req: Request) {
    return await this.usersService.remove(id, req);
  }
}
