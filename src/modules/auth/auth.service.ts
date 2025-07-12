import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/services/user.service';
import { UserPayload } from './interfaces/user-payload';
import { SignupRequestDto } from './dtos/signup-request.dto';
import { compareInputPasswordWithHash } from 'src/utils/hash';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(
    signupInfo: SignupRequestDto,
    username: string,
    pass: string,
  ): Promise<any> {
    const user = await this.userService.createNewUser(
      signupInfo.name,
      signupInfo.birthdate,
      signupInfo.email,
      signupInfo.phoneNumber,
      username,
      pass,
    );

    const payload: Partial<UserPayload> = { userId: user.id, username };

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.createRefreshToken(user.id),
    };
  }

  async signIn(username: string, pass: string): Promise<any> {
    const userAuth = await this.userService.getUserAuthByUsername(username);
    if (!userAuth) {
      return {
        access_token: null,
        refresh_token: null,
      };
    }
    const isPasswordMatch = await compareInputPasswordWithHash(
      pass,
      userAuth.hash,
    );

    if (!isPasswordMatch) {
      return {
        access_token: null,
        refresh_token: null,
      };
    }

    const { user, id: userAuthId } = userAuth;
    const payload: Partial<UserPayload> = { userId: user.id, username };

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.createRefreshToken(userAuthId),
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      this.jwtService.verify(refreshToken);
      const userAuth =
        await this.userService.getUserAuthByRefreshToken(refreshToken);

      const payload: Partial<UserPayload> = {
        userId: userAuth.user.id,
        username: userAuth.userName,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
        refresh_token: refreshToken,
      };
    } catch (err) {
      Logger.error('Error verifying refresh token:', err);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async createRefreshToken(userAuthId: string): Promise<string> {
    const refreshToken = this.jwtService.sign({}, { expiresIn: '7d' });

    const userAuth = await this.userService.getUserAuthById(userAuthId);
    userAuth.refreshToken = refreshToken;
    await this.userService.updateUserAuth(userAuth);

    return refreshToken;
  }
}
