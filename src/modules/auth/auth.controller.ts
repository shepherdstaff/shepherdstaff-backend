import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshRequestDto } from './dtos/refresh-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  logIn(@Body() logInDto: LoginDto) {
    return this.authService.signIn(logInDto.userName, logInDto.pass);
  }

  @Public()
  @Post('refresh-token')
  refreshAccessToken(@Body() refreshDto: RefreshRequestDto) {
    return this.authService.refreshAccessToken(refreshDto.refreshToken);
  }
}
