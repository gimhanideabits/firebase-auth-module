import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseCredentialsProvider } from '../providers';
import {
  UserCreationData,
  TokenVerificationOptions,
  VerifiedToken,
  CustomTokenOptions,
  RefreshTokenOptions,
  RefreshTokenResult,
} from '../interfaces';
import {
  UserCreationError,
  TokenVerificationError,
  InsufficientScopeError,
  TokenIssuanceError,
  TokenRefreshError,
  ConfigurationError,
} from '../errors';

@Injectable()
export class FirebaseAuthService implements OnModuleInit {
  private auth: admin.auth.Auth;
  private app: admin.app.App;

  constructor(private readonly credentialsProvider: FirebaseCredentialsProvider) {}

  async onModuleInit(): Promise<void> {
    try {
      const credentials = await this.credentialsProvider.getCredentials();

      
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: credentials.serviceAccount.projectId,
          privateKey: credentials.serviceAccount.privateKey,
          clientEmail: credentials.serviceAccount.clientEmail,
        }),
        projectId: credentials.serviceAccount.projectId,
      });

      this.auth = admin.auth(this.app);
    } catch (error) {
      throw new ConfigurationError('Failed to initialize Firebase Admin', error as Error);
    }
  }

  async createUser(userData: UserCreationData): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await this.auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });

      if (userData.customClaims) {
        await this.auth.setCustomUserClaims(userRecord.uid, userData.customClaims);
      }

      return userRecord;
    } catch (error) {
      throw new UserCreationError('Failed to create user', error as Error);
    }
  }

  async verifyToken(idToken: string, options?: TokenVerificationOptions): Promise<VerifiedToken> {
    try {
      console.log('Verifying ID token:', idToken.substring(0, 20) + '...');
      const decodedToken = await this.auth.verifyIdToken(idToken);
      console.log('ID token verified successfully:', decodedToken.uid);
      
      const tokenScopes = decodedToken.scopes as string[] || [];
      const requiredScopes = options?.requiredScopes || [];

      if (requiredScopes.length > 0) {
        const hasAllScopes = requiredScopes.every(scope => tokenScopes.includes(scope));
        if (!hasAllScopes) {
          throw new InsufficientScopeError(
            'Token does not contain required scopes',
            requiredScopes,
            tokenScopes
          );
        }
      }

      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        customClaims: decodedToken.custom_claims,
        scopes: tokenScopes,
      };
    } catch (error) {
      console.error('ID token verification failed:', error);
      if (error instanceof InsufficientScopeError) {
        throw error;
      }
      throw new TokenVerificationError('ID token verification failed', error as Error);
    }
  }

  async issueCustomToken(options: CustomTokenOptions): Promise<string> {
    try {
      const customToken = await this.auth.createCustomToken(options.uid, options.customClaims);
      return customToken;
    } catch (error) {
      throw new TokenIssuanceError('Failed to issue custom token', error as Error);
    }
  }

  async getUser(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.auth.getUser(uid);
    } catch (error) {
      throw new UserCreationError('Failed to get user', error as Error);
    }
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.auth.getUserByEmail(email);
    } catch (error) {
      throw new UserCreationError('Failed to get user by email', error as Error);
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      await this.auth.deleteUser(uid);
    } catch (error) {
      throw new UserCreationError('Failed to delete user', error as Error);
    }
  }

  async getCredentials(): Promise<{ webApiKey: string }> {
    const credentials = await this.credentialsProvider.getCredentials();
    return { webApiKey: credentials.webApiKey };
  }

  async refreshToken(options: RefreshTokenOptions): Promise<RefreshTokenResult> {
    try {
      const credentials = await this.credentialsProvider.getCredentials();
      const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${credentials.webApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: options.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      throw new TokenRefreshError('Failed to refresh token', error as Error);
    }
  }

  async verifyCustomToken(customToken: string): Promise<VerifiedToken> {
    try {
      const credentials = await this.credentialsProvider.getCredentials();
      
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${credentials.webApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Custom token verification failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      const decodedToken = await this.auth.verifyIdToken(data.idToken);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        customClaims: decodedToken.custom_claims,
        scopes: decodedToken.scopes as string[] || [],
      };
    } catch (error) {
      throw new TokenVerificationError('Custom token verification failed', error as Error);
    }
  }
}
