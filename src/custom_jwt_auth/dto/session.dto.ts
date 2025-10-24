import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Request DTOs
export class CreateSessionDto {
  @ApiProperty({
    description: 'Firebase custom token to exchange for ID and refresh tokens',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLlRva2VuIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2dldC10ZXN0ZWQtZGVtbyIsInN1YiI6IjEyMzQ1Njc4OTAifQ.example_signature',
    minLength: 10,
    maxLength: 2000,
    pattern: '^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+$',
    examples: {
      validToken: {
        summary: 'Valid Firebase Custom Token',
        description: 'A properly formatted Firebase custom token with header, payload, and signature',
        value: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLlRva2VuIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2dldC10ZXN0ZWQtZGVtbyIsInN1YiI6IjEyMzQ1Njc4OTAifQ.example_signature'
      },
      invalidToken: {
        summary: 'Invalid Token Format',
        description: 'An invalid token that will be rejected by validation',
        value: 'invalid_token_format'
      }
    }
  })
  @IsString({ message: 'Custom token must be a string' })
  @IsNotEmpty({ message: 'Custom token is required' })
  @Length(10, 2000, { message: 'Custom token length must be between 10 and 2000 characters' })
  @Matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, { 
    message: 'Custom token must be a valid JWT format' 
  })
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
