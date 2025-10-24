import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

export const CreateSessionApiOperation = ApiOperation({
  summary: 'Exchange Firebase custom token for ID and refresh tokens',
  description: `Exchanges a Firebase custom token for ID token and refresh token, returning them as secure HttpOnly cookies.

## Authentication Flow
1. Client obtains a Firebase custom token from your backend
2. Client sends the custom token to this endpoint
3. Server validates the custom token with Firebase
4. Server exchanges it for ID token and refresh token
5. Server sets HttpOnly cookies with the tokens
6. Client can now make authenticated requests using the cookies

## Cookie Security
- **ID Token Cookie**: HttpOnly, expires with Firebase token expiry
- **Refresh Token Cookie**: HttpOnly, Secure, SameSite=Strict, Path=/auth/refresh, expires with Firebase token expiry

## Use Cases
- Initial user authentication
- Session establishment
- Token refresh workflow`,
});

export const CreateSessionApiBody = ApiBody({
  type: 'CreateSessionDto',
  description: 'Firebase custom token to exchange for ID and refresh tokens',
  examples: {
    validToken: {
      summary: 'Valid custom token',
      description: 'A properly formatted Firebase custom token',
      value: {
        custom_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLlRva2VuIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2dldC10ZXN0ZWQtZGVtbyIsInN1YiI6IjEyMzQ1Njc4OTAifQ.example_signature'
      }
    },
    invalidToken: {
      summary: 'Invalid custom token',
      description: 'An invalid or malformed token that will be rejected',
      value: {
        custom_token: 'invalid_token_here'
      }
    }
  }
});

export const CreateSessionApiResponse200 = ApiResponse({
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
});

export const CreateSessionApiResponse400 = ApiResponse({
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
});

export const CreateSessionApiResponse401 = ApiResponse({
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
});
