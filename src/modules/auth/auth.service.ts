import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/services/user.service';
import { UserPayload } from './interfaces/user-payload';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<any> {
    const userAuth = await this.userService.getUserByUsername(username);
    if (userAuth?.hash !== pass) {
      throw new UnauthorizedException();
    }

    const { user } = userAuth;
    const payload: Partial<UserPayload> = { userId: user.id, username };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
