import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}

export class SigninDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class ValidateCustomTokenDto {
  @IsString()
  customToken: string;
}

export class UserResponseDto {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  createdAt: string;
  lastSignInTime?: string;
}
