import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Request DTOs
export class CreateSessionDto {
  @ApiProperty({
    description: 'Firebase custom token to exchange for ID and refresh tokens',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString({ message: 'Custom token must be a string' })
  @IsNotEmpty({ message: 'Custom token is required' })
  @Length(10, 2000, { message: 'Custom token length must be between 10 and 2000 characters' })
  custom_token: string;
}

// Response Types
export interface SessionMetadata {
  request_id: string;
  timestamp: string;
}

export interface SessionSuccessResponse {
  ok: true;
  message: string;
  data: Record<string, never>;
  metadata: SessionMetadata;
}

export interface SessionErrorDetail {
  code: string;
  error: string;
}

export interface SessionErrorResponse {
  ok: false;
  message: string;
  errors: SessionErrorDetail[];
  metadata: SessionMetadata;
}

// Controller Method Types
export interface CreateSessionRequest {
  custom_token: string;
}

export interface CreateSessionSuccessResult {
  response: SessionSuccessResponse;
  cookies: {
    id_token: string;
    refresh_token: string;
  };
}

export interface CreateSessionErrorResult {
  error: SessionErrorResponse;
}

export type CreateSessionResult = CreateSessionSuccessResult | CreateSessionErrorResult;

// Token Exchange Types
export interface TokenExchangeResult {
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Cookie Configuration Types
export interface CookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path?: string;
}

export interface CookieSettings {
  idToken: CookieConfig;
  refreshToken: CookieConfig;
}