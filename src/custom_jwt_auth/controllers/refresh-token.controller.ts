import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseFilters } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RefreshTokenService, RefreshTokenResult } from '../services/refresh-token.service';
import { GlobalErrorFilter } from '../errors/global-error.filter';
import { 
  RefreshTokenApiOperation,
  RefreshTokenApiBody,
  RefreshTokenApiResponse200,
  RefreshTokenApiResponse400,
  RefreshTokenApiResponse401
} from '../swagger/decorators/auth';

@ApiTags('Authentication')
@Controller('auth')
@UseFilters(GlobalErrorFilter)
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @RefreshTokenApiOperation
  @RefreshTokenApiBody
  @RefreshTokenApiResponse200
  @RefreshTokenApiResponse400
  @RefreshTokenApiResponse401
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Res() res: Response): Promise<void> {
    try {
      const tokenResult: RefreshTokenResult = await this.refreshTokenService.refreshIdToken(refreshTokenDto.refresh_token);
      
      this.setCookies(res, tokenResult);
      
      const response = {
        ok: true,
        message: 'token refreshed successfully',
        data: {},
        metadata: {
          request_id: this.generateRequestId(),
          timestamp: new Date().toISOString(),
        },
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  private setCookies(res: Response, tokenResult: RefreshTokenResult): void {
    const cookieSettings = this.getCookieSettings(tokenResult.expiresIn);

    res.cookie('id_token', tokenResult.idToken, cookieSettings.idToken);
    res.cookie('refresh_token', tokenResult.refreshToken, cookieSettings.refreshToken);
  }

  private getCookieSettings(expiresIn: number): { idToken: any; refreshToken: any } {
    const idTokenMaxAge = expiresIn * 1000;
    const refreshTokenMaxAge = expiresIn * 1000; // Use Firebase's default TTL

    return {
      idToken: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: idTokenMaxAge,
      },
      refreshToken: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge: refreshTokenMaxAge,
      },
    };
  }

  private generateRequestId(): string {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
      const r = Math.floor(Math.random() * 16);
      return r.toString(16);
    });
  }
}
