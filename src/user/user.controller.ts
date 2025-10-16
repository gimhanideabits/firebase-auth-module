import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto, SigninDto, UserResponseDto, RefreshTokenDto } from './dto/user.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<UserResponseDto> {
    return await this.userService.signup(signupDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() signinDto: SigninDto) {
    return await this.userService.signin(signinDto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout() {
    return { message: 'Successfully signed out' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.userService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Request() req): Promise<UserResponseDto> {
    return await this.userService.getUserById(req.user.uid);
  }
}
