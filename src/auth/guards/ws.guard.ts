import { CanActivate, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const bearerToken =
      context.args[0].handshake.headers.authorization.split(' ')[1];

    try {
      const decoded = this.jwtService.verify<{ sub: string }>(bearerToken, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });
      return new Promise((resolve, reject) => {
        return this.userService.findById(decoded.sub).then((user) => {
          if (user) {
            resolve(user);
          } else {
            reject(false);
          }
        });
      });
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}
