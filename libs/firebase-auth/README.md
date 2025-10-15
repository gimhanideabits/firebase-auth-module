# Firebase Auth Library for NestJS

A modular NestJS library that wraps Firebase Admin/Auth and provides clean interfaces for user management, token verification, and authentication operations.

## Features

- **User Creation**: Create users with custom claims and metadata
- **Token Verification**: Verify ID tokens with optional scope validation
- **Token Issuance**: Issue custom tokens for server-to-server authentication
- **Token Refresh**: Refresh expired tokens
- **Role-based Access**: Verify tokens with required scopes
- **Dependency Injection**: Full NestJS DI support
- **Credential Agnostic**: Flexible credential management via providers
- **Type Safety**: Full TypeScript support with typed errors

## Installation

```bash
npm install firebase-admin firebase
```

## Quick Start

### 1. Environment Variables Setup

Create a `.env` file with your Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_WEB_API_KEY=your-web-api-key
```

### 2. Module Registration

#### Using Environment Variables

```typescript
import { Module } from '@nestjs/common';
import { FirebaseAuthModule, EnvironmentCredentialsProvider } from '@app/firebase-auth';

@Module({
  imports: [
    FirebaseAuthModule.forRoot({
      credentialsProvider: new EnvironmentCredentialsProvider(),
    }),
  ],
})
export class AppModule {}
```

#### Using Static Credentials

```typescript
import { Module } from '@nestjs/common';
import { FirebaseAuthModule, StaticCredentialsProvider } from '@app/firebase-auth';

@Module({
  imports: [
    FirebaseAuthModule.forRoot({
      credentialsProvider: new StaticCredentialsProvider({
        serviceAccount: {
          projectId: 'your-project-id',
          privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
          clientEmail: 'firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com',
        },
        webApiKey: 'your-web-api-key',
      }),
    }),
  ],
})
export class AppModule {}
```

#### Using Async Configuration

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseAuthModule, StaticCredentialsProvider } from '@app/firebase-auth';

@Module({
  imports: [
    FirebaseAuthModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return new StaticCredentialsProvider({
          serviceAccount: {
            projectId: configService.get('FIREBASE_PROJECT_ID'),
            privateKey: configService.get('FIREBASE_PRIVATE_KEY'),
            clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
          },
          webApiKey: configService.get('FIREBASE_WEB_API_KEY'),
        });
      },
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 3. Using the Service

```typescript
import { Injectable } from '@nestjs/common';
import { FirebaseAuthService } from '@app/firebase-auth';

@Injectable()
export class AuthController {
  constructor(private readonly firebaseAuth: FirebaseAuthService) {}

  async createUser(email: string, password: string) {
    return await this.firebaseAuth.createUser({
      email,
      password,
      displayName: 'John Doe',
      customClaims: { role: 'admin', scopes: ['read', 'write'] },
    });
  }

  async verifyToken(token: string, requiredScopes?: string[]) {
    return await this.firebaseAuth.verifyToken(token, {
      requiredScopes,
    });
  }

  async issueCustomToken(uid: string) {
    return await this.firebaseAuth.issueCustomToken({
      uid,
      customClaims: { role: 'user' },
    });
  }

  async refreshToken(refreshToken: string) {
    return await this.firebaseAuth.refreshToken({
      refreshToken,
    });
  }
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

Refreshes an expired token.

```typescript
const result = await firebaseAuth.refreshToken({
  refreshToken: 'refresh_token_here',
});
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

### Error Codes

```typescript
import { ERROR_CODES } from '@app/firebase-auth';

// Available error codes:
ERROR_CODES.INVALID_CREDENTIALS
ERROR_CODES.USER_CREATION_FAILED
ERROR_CODES.TOKEN_VERIFICATION_FAILED
ERROR_CODES.INSUFFICIENT_SCOPE
ERROR_CODES.TOKEN_ISSUANCE_FAILED
ERROR_CODES.TOKEN_REFRESH_FAILED
ERROR_CODES.CONFIGURATION_ERROR
```

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

## Plugin Usage (Standalone)

For non-NestJS applications, you can use the plugin directly:

```typescript
import { FirebaseAuthPlugin } from '@app/firebase-auth';

const plugin = FirebaseAuthPlugin.createFromEnvironment();
await plugin.initialize();

const service = plugin.getService();
const user = await service.createUser({
  email: 'user@example.com',
  password: 'password123',
});
```

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
