import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseFilters } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
<<<<<<< HEAD
import { 
  CreateSessionDto,
  SessionSuccessResponse,
  SessionErrorResponse,
  CreateSessionRequest,
  CreateSessionSuccessResult,
  TokenExchangeResult,
  CookieSettings
} from '../dto/session.dto';
=======
import { CreateSessionDto } from '../dto/session.dto';
import type { SessionResponse } from '../dto/session.dto';
>>>>>>> c2386ccf859042da6ca5d49f3f6e621450be04d4
import { TokenExchangeService } from '../services/token-exchange.service';
import { GlobalErrorFilter } from '../errors/global-error.filter';
import { 
  CustomTokenInvalidError, 
  CustomTokenMissingError, 
  CustomTokenTypeError, 
  CustomTokenLengthError 
} from '../errors/auth.errors';

@ApiTags('Authentication')
@Controller('auth')
@UseFilters(GlobalErrorFilter)
export class SessionsController {
  constructor(private readonly tokenExchangeService: TokenExchangeService) {}

  @Post('sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exchange custom token for ID and refresh tokens',
    description: 'Accepts a Firebase custom token and exchanges it for ID token and refresh token, returning them as HttpOnly cookies',
  })
  @ApiBody({
    type: CreateSessionDto,
    description: 'Custom token to exchange',
  })
  @ApiResponse({
    status: 200,
    description: 'Token exchange successful',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'token exchanged successfully' },
        data: { type: 'object', example: {} },
        metadata: {
          type: 'object',
          properties: {
            request_id: { type: 'string', example: 'a1b2-c3d4-e5f6-g7h8' },
            timestamp: { type: 'string', example: '2025-01-23T00:00:00Z' },
          },
        },
      },
    },
    headers: {
      'Set-Cookie': {
        description: 'HttpOnly cookies containing ID token and refresh token',
        schema: {
          type: 'string',
          example: 'id_token=eyJhbGciOiJSUzI1NiIs...; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid custom token',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'token exchange failed' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'bad_request' },
              error: { type: 'string', example: 'invalid token provided' },
            },
          },
        },
        metadata: {
          type: 'object',
          properties: {
            request_id: { type: 'string', example: 'a1b2-c3d4-e5f6-g7h8' },
            timestamp: { type: 'string', example: '2025-01-23T00:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Firebase rejected the token',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'token exchange failed' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'custom_token_exchange_failed' },
              error: { type: 'string', example: 'Firebase rejected custom token' },
            },
          },
        },
        metadata: {
          type: 'object',
          properties: {
            request_id: { type: 'string', example: 'a1b2-c3d4-e5f6-g7h8' },
            timestamp: { type: 'string', example: '2025-01-23T00:00:00Z' },
          },
        },
      },
    },
  })
  async createSession(@Body() createSessionDto: CreateSessionDto, @Res() res: Response): Promise<void> {
    try {
      this.validateCustomToken(createSessionDto.custom_token);
      
      const tokenResult: TokenExchangeResult = await this.tokenExchangeService.exchangeCustomToken(createSessionDto.custom_token);
      
      this.setCookies(res, tokenResult);
      
      const response: SessionSuccessResponse = {
        ok: true,
        message: 'token exchanged successfully',
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

  private validateCustomToken(customToken: string): void {
    if (!customToken) {
      throw new CustomTokenMissingError();
    }

    if (typeof customToken !== 'string') {
      throw new CustomTokenTypeError();
    }

    if (customToken.length < 10 || customToken.length > 2000) {
      throw new CustomTokenLengthError();
    }

    if (!customToken.trim()) {
      throw new CustomTokenInvalidError('Custom token cannot be empty');
    }
  }

<<<<<<< HEAD
  private setCookies(res: Response, tokenResult: TokenExchangeResult): void {
    const cookieSettings: CookieSettings = this.getCookieSettings(tokenResult.expiresIn);

    res.cookie('id_token', tokenResult.idToken, cookieSettings.idToken);
    res.cookie('refresh_token', tokenResult.refreshToken, cookieSettings.refreshToken);
  }

  private getCookieSettings(expiresIn: number): CookieSettings {
    const idTokenMaxAge = expiresIn * 1000;
    const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

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
=======
  private setCookies(res: Response, tokenResult: { idToken: string; refreshToken: string; expiresIn: number }): void {
    const idTokenMaxAge = tokenResult.expiresIn * 1000;
    const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    res.cookie('id_token', tokenResult.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: idTokenMaxAge,
    });

    res.cookie('refresh_token', tokenResult.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: refreshTokenMaxAge,
    });
>>>>>>> c2386ccf859042da6ca5d49f3f6e621450be04d4
  }

  private generateRequestId(): string {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
      const r = Math.floor(Math.random() * 16);
      return r.toString(16);
    });
  }
}
