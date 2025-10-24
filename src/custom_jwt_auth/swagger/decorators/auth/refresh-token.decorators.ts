import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

export const RefreshTokenApiOperation = ApiOperation({
  summary: 'Refresh Firebase ID token using refresh token',
  description: `Exchanges a Firebase refresh token for a new ID token and refresh token, returning them as secure HttpOnly cookies.

## Token Refresh Flow
1. Client sends existing refresh token to this endpoint
2. Server validates the refresh token with Google SecureToken API
3. Server exchanges it for new ID token and refresh token
4. Server sets HttpOnly cookies with the new tokens
5. Client can continue making authenticated requests

## Cookie Security
- **ID Token Cookie**: HttpOnly, expires with Firebase token expiry
- **Refresh Token Cookie**: HttpOnly, Secure, SameSite=Strict, Path=/auth/refresh, expires with Firebase token expiry

## Use Cases
- Automatic token refresh
- Session renewal
- Maintaining user authentication`,
});

export const RefreshTokenApiBody = ApiBody({
  type: 'RefreshTokenDto',
  description: 'Firebase refresh token to exchange for new ID and refresh tokens',
  examples: {
    validRefreshToken: {
      summary: 'Valid refresh token',
      description: 'A properly formatted Firebase refresh token',
      value: {
        refresh_token: 'AMf-vBz5tQ_kdiL7XDpU17cwGuInFrM6PXxeswRP5vEbRPScz96L2F4t7iH4U3ER7ZMDUK-gldq14mnT2OEN4RrkfNXHys_Q4bx0UtZ7G40y3WYqKJLD2qXZrGB6ig4ZwEPIoUokCxB2oUJzpmASf2eAS0YSvPWHwxHHgEEzgt8dWkVCxOQ3sgdkaamVwbVSjJ_9FZdK5cCO3aq21haL5imzYbmWyrZMTYjltOtqF-QDywLxmfu1eMA'
      }
    },
    invalidRefreshToken: {
      summary: 'Invalid refresh token',
      description: 'An invalid or expired token that will be rejected',
      value: {
        refresh_token: 'invalid_refresh_token_here'
      }
    }
  }
});

export const RefreshTokenApiResponse200 = ApiResponse({
  status: 200,
  description: 'Token refresh successful',
  schema: {
    type: 'object',
    properties: {
      ok: { type: 'boolean', example: true },
      message: { type: 'string', example: 'token refreshed successfully' },
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
      description: 'HttpOnly cookies containing new ID token and refresh token',
      schema: {
        type: 'string',
        example: 'id_token=eyJhbGciOiJSUzI1NiIs...; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh',
      },
    },
  },
});

export const RefreshTokenApiResponse400 = ApiResponse({
  status: 400,
  description: 'Bad request - invalid refresh token',
  schema: {
    type: 'object',
    properties: {
      ok: { type: 'boolean', example: false },
      message: { type: 'string', example: 'token refresh failed' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'bad_request' },
            error: { type: 'string', example: 'invalid refresh token provided' },
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
});

export const RefreshTokenApiResponse401 = ApiResponse({
  status: 401,
  description: 'Unauthorized - Google rejected the refresh token',
  schema: {
    type: 'object',
    properties: {
      ok: { type: 'boolean', example: false },
      message: { type: 'string', example: 'token refresh failed' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'refresh_token_exchange_failed' },
            error: { type: 'string', example: 'Google rejected refresh token' },
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
});
