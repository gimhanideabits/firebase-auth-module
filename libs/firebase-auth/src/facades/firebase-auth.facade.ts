import { Injectable } from '@nestjs/common';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import {
  UserCreationData,
  TokenVerificationOptions,
  VerifiedToken,
  CustomTokenOptions,
  RefreshTokenOptions,
  RefreshTokenResult,
} from '../interfaces';

export interface FirebaseAuthFacade {
  createUser(userData: UserCreationData): Promise<VerifiedToken>;
  verifyAndGetUser(idToken: string, options?: TokenVerificationOptions): Promise<VerifiedToken>;
  issueCustomToken(options: CustomTokenOptions): Promise<string>;
  getUserById(uid: string): Promise<VerifiedToken>;
  getUserByEmail(email: string): Promise<VerifiedToken>;
  deleteUser(uid: string): Promise<void>;
  refreshToken(options: RefreshTokenOptions): Promise<RefreshTokenResult>;
  getWebApiKey(): Promise<string>;
  
  authenticateUser(idToken: string, requiredScopes?: string[]): Promise<VerifiedToken>;
  createUserWithClaims(userData: UserCreationData, customClaims?: Record<string, any>): Promise<VerifiedToken>;
  getUserProfile(identifier: string, byEmail?: boolean): Promise<VerifiedToken>;
  manageUserSession(refreshToken: string): Promise<RefreshTokenResult>;
}

@Injectable()
export class FirebaseAuthFacadeImpl implements FirebaseAuthFacade {
  constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  async createUser(userData: UserCreationData): Promise<VerifiedToken> {
    const userRecord = await this.firebaseAuthService.createUser(userData);
    
    return {
      uid: userRecord.uid,
      email: userRecord.email || '',
      emailVerified: userRecord.emailVerified,
      customClaims: userRecord.customClaims,
      scopes: [],
    };
  }

  async verifyAndGetUser(idToken: string, options?: TokenVerificationOptions): Promise<VerifiedToken> {
    return this.firebaseAuthService.verifyToken(idToken, options);
  }

  async issueCustomToken(options: CustomTokenOptions): Promise<string> {
    return this.firebaseAuthService.issueCustomToken(options);
  }

  async getUserById(uid: string): Promise<VerifiedToken> {
    const userRecord = await this.firebaseAuthService.getUser(uid);
    
    return {
      uid: userRecord.uid,
      email: userRecord.email || '',
      emailVerified: userRecord.emailVerified,
      customClaims: userRecord.customClaims,
      scopes: [],
    };
  }

  async getUserByEmail(email: string): Promise<VerifiedToken> {
    const userRecord = await this.firebaseAuthService.getUserByEmail(email);
    
    return {
      uid: userRecord.uid,
      email: userRecord.email || '',
      emailVerified: userRecord.emailVerified,
      customClaims: userRecord.customClaims,
      scopes: [],
    };
  }

  async deleteUser(uid: string): Promise<void> {
    return this.firebaseAuthService.deleteUser(uid);
  }

  async refreshToken(options: RefreshTokenOptions): Promise<RefreshTokenResult> {
    return this.firebaseAuthService.refreshToken(options);
  }

  async getWebApiKey(): Promise<string> {
    const credentials = await this.firebaseAuthService.getCredentials();
    return credentials.webApiKey;
  }

  async authenticateUser(idToken: string, requiredScopes?: string[]): Promise<VerifiedToken> {
    const options: TokenVerificationOptions = requiredScopes ? { requiredScopes } : {};
    return this.verifyAndGetUser(idToken, options);
  }

  async createUserWithClaims(userData: UserCreationData, customClaims?: Record<string, any>): Promise<VerifiedToken> {
    const userDataWithClaims = {
      ...userData,
      customClaims,
    };
    return this.createUser(userDataWithClaims);
  }

  async getUserProfile(identifier: string, byEmail = false): Promise<VerifiedToken> {
    if (byEmail) {
      return this.getUserByEmail(identifier);
    }
    return this.getUserById(identifier);
  }

  async manageUserSession(refreshToken: string): Promise<RefreshTokenResult> {
    return this.refreshToken({ refreshToken });
  }
}
