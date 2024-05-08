import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { RegisterDto } from './dto/register.dto';
import { Request as RequestType } from 'express';
import { User } from 'src/user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(@Request() req: RequestType, @Body() _: LoginDto): Promise<any> {
    const user = req.user as User;
    return await this.authService.login(user);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);
  }
}
