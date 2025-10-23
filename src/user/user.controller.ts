import { Controller, Post, Get, Body, UseGuards, Request, Response, HttpCode, HttpStatus, Headers, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto, SigninDto, UserResponseDto, RefreshTokenDto, ValidateCustomTokenDto } from './dto/user.dto';
import { CustomJwtAuthGuard } from '../guards/custom-jwt-auth.guard';
import { DomainConfigService } from '../config/domain-config.service';

@Controller('auth')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly domainConfig: DomainConfigService
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<UserResponseDto> {
    return await this.userService.signup(signupDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() signinDto: SigninDto, @Response() res) {
    const result = await this.userService.signin(signinDto, res);
    return res.json(result);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@Response() res) {
    this.userService.clearAuthCookies(res);
    return res.json({ message: 'Successfully signed out' });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Response() res) {
    const result = await this.userService.refreshToken(refreshTokenDto.refreshToken, res);
    return res.json(result);
  }

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  async validateCustomToken(
    @Body() validateTokenDto: ValidateCustomTokenDto,
    @Request() req,
    @Response() res
  ) {
    const origin = req.headers.origin || req.headers.host || req.get('host');
    const domain = this.extractDomainFromOrigin(origin);
    
    if (!domain) {
      throw new BadRequestException('Invalid or missing domain in request');
    }

    const result = await this.userService.validateCustomTokenAndSetCookie(validateTokenDto, res, domain);
    return res.json(result);
  }

  @Post('refresh-jwt')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CustomJwtAuthGuard)
  async refreshJwt(@Request() req, @Response() res) {
    const origin = req.headers.origin || req.headers.host || req.get('host');
    const domain = this.extractDomainFromOrigin(origin);
    
    if (!domain) {
      throw new BadRequestException('Invalid or missing domain in request');
    }

    const result = await this.userService.refreshCustomJwt(req.user, res, domain);
    return res.json(result);
  }

  @Get('profile')
  @UseGuards(CustomJwtAuthGuard)
  async getProfile(@Request() req): Promise<UserResponseDto> {
    return await this.userService.getUserById(req.user.uid);
  }

  private extractDomainFromOrigin(origin: string): string | null {
    return this.domainConfig.extractDomainFromOrigin(origin);
  }
}
