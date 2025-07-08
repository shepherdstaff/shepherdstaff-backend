import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshRequestDto } from './dtos/refresh-request.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Log in to the application',
    description:
      'This endpoint allows users to log in by providing their username and password. It returns an access token and a refresh token upon successful authentication.',
  })
  async logIn(@Body() logInDto: LoginDto) {
    return this.authService.signIn(logInDto.userName, logInDto.pass);
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'This endpoint allows users to refresh their access token using a valid refresh token. It returns a new access token.',
  })
  async refreshAccessToken(@Body() refreshDto: RefreshRequestDto) {
    return this.authService.refreshAccessToken(refreshDto.refreshToken);
  }
}
