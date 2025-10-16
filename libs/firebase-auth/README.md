# Firebase Auth Library for NestJS

A modular NestJS library that wraps Firebase Admin/Auth and provides clean interfaces for user management, token verification, and authentication operations.

## Features

- **User Management**: Create, retrieve, and delete users
- **Authentication**: Sign up, sign in, and sign out users
- **Token Verification**: Verify ID tokens with optional scope validation
- **Token Refresh**: Refresh expired tokens
- **Role-based Access**: Verify tokens with required scopes
- **Dependency Injection**: Full NestJS DI support
- **Credential Agnostic**: Flexible credential management via providers
- **Type Safety**: Full TypeScript support with typed errors
- **REST API Integration**: Uses Firebase REST API for authentication

## Installation

```bash
npm install firebase-admin firebase @nestjs/config class-validator class-transformer
```

## Quick Start

### 1. Environment Variables Setup

Create a `.env` file with your Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_WEB_API_KEY=your-web-api-key
PORT=3000
NODE_ENV=development
```

### 2. Firebase Service Account Setup

Create a `firebase-service-account.json` file in your project root:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com"
}
```

### 3. Module Registration

#### Using JSON File Credentials (Recommended)

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseAuthModule, JsonFileCredentialsProvider } from '@app/firebase-auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseAuthModule.forRoot({
      credentialsProvider: new JsonFileCredentialsProvider(),
    }),
  ],
})
export class AppModule {}
```

#### Using Environment Variables

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseAuthModule, EnvironmentCredentialsProvider } from '@app/firebase-auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseAuthModule.forRoot({
      credentialsProvider: new EnvironmentCredentialsProvider(),
    }),
  ],
})
export class AppModule {}
```

### 4. Authentication Endpoints

The library provides ready-to-use authentication endpoints:

#### Sign Up
```bash
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

#### Sign In
```bash
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Response:
{
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastSignInTime": "2024-01-01T12:00:00Z"
  },
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here"
}
```

#### Refresh Token
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}

# Response:
{
  "accessToken": "new_id_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 3600
}
```

#### Get Profile (Protected)
```bash
GET /auth/profile
Authorization: Bearer YOUR_ID_TOKEN

# Response:
{
  "uid": "user123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "lastSignInTime": "2024-01-01T12:00:00Z"
}
```

#### Sign Out
```bash
POST /auth/signout
Content-Type: application/json

# Response:
{
  "message": "Successfully signed out"
}
```

## API Reference

### FirebaseAuthService

#### `createUser(userData: UserCreationData): Promise<UserRecord>`

Creates a new user with optional custom claims.

```typescript
const user = await firebaseAuth.createUser({
  email: 'user@example.com',
  password: 'securePassword123',
  displayName: 'John Doe',
  customClaims: { role: 'admin', scopes: ['read', 'write'] },
});
```

#### `verifyToken(idToken: string, options?: TokenVerificationOptions): Promise<VerifiedToken>`

Verifies an ID token and optionally checks for required scopes.

```typescript
const verifiedToken = await firebaseAuth.verifyToken(token, {
  requiredScopes: ['read', 'write'],
});
```

#### `issueCustomToken(options: CustomTokenOptions): Promise<string>`

Issues a custom token for server-to-server authentication.

```typescript
const customToken = await firebaseAuth.issueCustomToken({
  uid: 'user123',
  customClaims: { role: 'admin' },
});
```

#### `refreshToken(options: RefreshTokenOptions): Promise<RefreshTokenResult>`

Refreshes an expired token using Firebase REST API.

```typescript
const result = await firebaseAuth.refreshToken({
  refreshToken: 'refresh_token_here',
});
```

#### `getCredentials(): Promise<{ webApiKey: string }>`

Gets Firebase credentials for REST API calls.

```typescript
const credentials = await firebaseAuth.getCredentials();
// Returns: { webApiKey: "your-web-api-key" }
```

### Authentication Guard

Use the `AuthGuard` to protect routes that require authentication:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';

@Controller('protected')
export class ProtectedController {
  @Get('data')
  @UseGuards(AuthGuard)
  getProtectedData(@Request() req) {
    // req.user contains the verified token data
    return { userId: req.user.uid, email: req.user.email };
  }
}
```

### Scope Verification

The library supports role-based access control through custom scopes. When verifying tokens, you can specify required scopes:

```typescript
const verifiedToken = await firebaseAuth.verifyToken(token, {
  requiredScopes: ['admin', 'write'],
});
```

If the token doesn't contain all required scopes, an `InsufficientScopeError` will be thrown.

## Error Handling

The library provides typed errors for all failure cases:

### Error Types

- `InvalidCredentialsError`: Invalid Firebase credentials
- `UserCreationError`: Failed to create user
- `TokenVerificationError`: Token verification failed
- `InsufficientScopeError`: Token lacks required scopes
- `TokenIssuanceError`: Failed to issue custom token
- `TokenRefreshError`: Failed to refresh token
- `ConfigurationError`: Firebase configuration error

### Error Handling Example

```typescript
import { 
  FirebaseAuthService, 
  InsufficientScopeError, 
  TokenVerificationError,
  ERROR_CODES 
} from '@app/firebase-auth';

try {
  const verifiedToken = await firebaseAuth.verifyToken(token, {
    requiredScopes: ['admin'],
  });
} catch (error) {
  if (error instanceof InsufficientScopeError) {
    console.log('Missing scopes:', error.requiredScopes);
    console.log('Token scopes:', error.tokenScopes);
  } else if (error instanceof TokenVerificationError) {
    console.log('Token verification failed:', error.message);
  }
}
```

## Token Flow

1. **Sign Up/Sign In** → Get ID token + refresh token
2. **Use ID token** for API calls (profile endpoint)
3. **When ID token expires** → Use refresh token to get new tokens
4. **Repeat** as needed

## Custom Credentials Provider

You can create custom credential providers by extending the abstract class:

```typescript
import { Injectable } from '@nestjs/common';
import { FirebaseCredentialsProvider, FirebaseCredentials } from '@app/firebase-auth';

@Injectable()
export class DatabaseCredentialsProvider extends FirebaseCredentialsProvider {
  async getCredentials(): Promise<FirebaseCredentials> {
    const credentials = await this.database.getFirebaseCredentials();
    return credentials;
  }
}
```

## Available Credential Providers

- `EnvironmentCredentialsProvider`: Reads from environment variables
- `StaticCredentialsProvider`: Uses static credentials
- `JsonFileCredentialsProvider`: Reads from firebase-service-account.json file

