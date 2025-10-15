import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { FirebaseAuthService } from '@app/firebase-auth';
import { SignupDto, SigninDto, UserResponseDto } from './dto/user.dto';

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

  async signin(signinDto: SigninDto): Promise<{ user: UserResponseDto; customToken: string }> {
    try {
      const customToken = await this.firebaseAuth.issueCustomToken({
        uid: signinDto.email,
        customClaims: { email: signinDto.email },
      });

      const userRecord = await this.getUserByEmail(signinDto.email);
      
      return {
        user: this.mapUserRecordToResponse(userRecord),
        customToken,
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
