import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { FirebaseAuthService } from '@app/firebase-auth';
import { SignupDto, SigninDto, UserResponseDto, ValidateCustomTokenDto } from './dto/user.dto';
import { Response } from 'express';
import { DomainConfigService } from '../config/domain-config.service';
import { CustomJwtService, CustomJwtPayload } from '../services/custom-jwt.service';

@Injectable()
export class UserService {
  constructor(
    private readonly firebaseAuth: FirebaseAuthService,
    private readonly domainConfig: DomainConfigService,
    private readonly customJwtService: CustomJwtService
  ) {}

  async signup(signupDto: SignupDto): Promise<UserResponseDto> {
    try {
      const userRecord = await this.firebaseAuth.createUser({
        email: signupDto.email,
        password: signupDto.password,
        displayName: signupDto.displayName,
      });

      return this.mapUserRecordToResponse(userRecord);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async signin(signinDto: SigninDto, res: Response): Promise<{ user: UserResponseDto; customToken: string; message: string }> {
    try {
      const credentials = await this.firebaseAuth.getCredentials();
      
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${credentials.webApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signinDto.email,
          password: signinDto.password,
          returnSecureToken: true,
        }),
      });

      if (!response.ok) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const data = await response.json();
      
      const userRecord = await this.getUserByEmail(signinDto.email);
      
      const customToken = await this.firebaseAuth.issueCustomToken({
        uid: userRecord.uid,
        customClaims: {
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified,
        },
      });

      this.setAuthCookie(res, customToken, data.refreshToken);
      
      return {
        user: this.mapUserRecordToResponse(userRecord),
        customToken: customToken,
        message: 'Login successful - Use custom token for authentication',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async getUserById(uid: string): Promise<UserResponseDto> {
    try {
      const userRecord = await this.firebaseAuth.getUser(uid);
      return this.mapUserRecordToResponse(userRecord);
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }
  }

  async getUserByEmail(email: string) {
    return await this.firebaseAuth.getUserByEmail(email);
  }

  async refreshToken(refreshToken: string, res: Response) {
    try {
      const result = await this.firebaseAuth.refreshToken({ refreshToken });
      
      const verifiedToken = await this.firebaseAuth.verifyToken(result.accessToken);
      
      const customToken = await this.firebaseAuth.issueCustomToken({
        uid: verifiedToken.uid,
        customClaims: {
          email: verifiedToken.email,
          displayName: verifiedToken.customClaims?.displayName,
          emailVerified: verifiedToken.emailVerified,
        },
      });

      this.setAuthCookie(res, customToken, result.refreshToken);
      
      return {
        message: 'Token refreshed successfully',
        user: {
          uid: verifiedToken.uid,
          email: verifiedToken.email,
          displayName: verifiedToken.customClaims?.displayName,
          emailVerified: verifiedToken.emailVerified,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private setAuthCookie(res: Response, customToken: string, refreshToken: string): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      domain: 'www.gettsted.com',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('authToken', customToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for refresh token
    });
  }

  async validateCustomTokenAndSetCookie(
    validateTokenDto: ValidateCustomTokenDto, 
    res: Response, 
    domain: string
  ): Promise<{ user: UserResponseDto; message: string; customJwt: string }> {
    try {
      const verifiedToken = await this.firebaseAuth.verifyCustomToken(validateTokenDto.customToken);
      
      const userRecord = await this.firebaseAuth.getUser(verifiedToken.uid);
      
      const customJwt = this.customJwtService.generateToken({
        uid: verifiedToken.uid,
        email: verifiedToken.email || '',
        emailVerified: verifiedToken.emailVerified || false,
        displayName: userRecord.displayName,
        customClaims: verifiedToken.customClaims,
        domain: domain,
      });
      
      this.setCustomJwtCookie(res, customJwt.token, domain);
      
      return {
        user: this.mapUserRecordToResponse(userRecord),
        message: 'Custom token validated and JWT cookie set successfully',
        customJwt: customJwt.token,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid custom token');
    }
  }

  private setCustomJwtCookie(res: Response, jwtToken: string, domain: string): void {
    this.domainConfig.validateDomain(domain);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      domain: domain,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('authToken', jwtToken, cookieOptions);
  }

  private setAuthCookieForDomain(res: Response, customToken: string, domain: string): void {
    this.domainConfig.validateDomain(domain);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      domain: domain,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('authToken', customToken, cookieOptions);
  }

  clearAuthCookies(res: Response, domain?: string): void {
    const targetDomain = domain || 'www.gettsted.com';
    res.clearCookie('authToken', { domain: targetDomain });
    res.clearCookie('refreshToken', { domain: targetDomain });
  }

  async refreshCustomJwt(
    currentUser: CustomJwtPayload,
    res: Response,
    domain: string
  ): Promise<{ message: string; customJwt: string }> {
    try {
      const customJwt = this.customJwtService.generateToken({
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified,
        displayName: currentUser.displayName,
        customClaims: currentUser.customClaims,
        domain: domain,
      });
      
      this.setCustomJwtCookie(res, customJwt.token, domain);
      
      return {
        message: 'JWT refreshed successfully',
        customJwt: customJwt.token,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to refresh JWT');
    }
  }

  private mapUserRecordToResponse(userRecord: any): UserResponseDto {
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified,
      createdAt: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
    };
  }
}
