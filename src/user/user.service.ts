import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { FirebaseAuthService } from '@app/firebase-auth';
import { SignupDto, SigninDto, UserResponseDto } from './dto/user.dto';
import { auth } from 'firebase-admin';

@Injectable()
export class UserService {
  constructor(private readonly firebaseAuth: FirebaseAuthService) {}

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

  async signin(signinDto: SigninDto): Promise<{ user: UserResponseDto; idToken: string; refreshToken: string }> {
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

   
      const customToken = await this.firebaseAuth.issueCustomToken({
        uid: data.localId,
        customClaims: {
          email: signinDto.email,
        },
      });
      
      const userRecord = await this.getUserByEmail(signinDto.email);
      
      return {
        user: this.mapUserRecordToResponse(userRecord),
        idToken: customToken,
        refreshToken: data.refreshToken,
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

  async refreshToken(refreshToken: string) {
    try {
      const result = await this.firebaseAuth.refreshToken({ refreshToken });
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
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
