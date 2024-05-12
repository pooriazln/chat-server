import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import { User } from 'src/user/entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new BadRequestException('wrong username or password');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('wrong username or password');
    }

    return user;
  }

  async login(user: User): Promise<{ accessToken: string }> {
    const payload = { sub: user._id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const userExist = await this.userService.findByUsername(
      registerDto.username,
    );

    if (userExist) throw new ConflictException('username already taken');

    const user = await this.userService.create(
      registerDto.username,
      registerDto.password,
      registerDto.profile_img,
    );

    return this.login(user);
  }
}
