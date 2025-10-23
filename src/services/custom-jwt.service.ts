import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface CustomJwtPayload {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  customClaims?: Record<string, any>;
  domain: string;
  iat?: number;
  exp?: number;
}

export interface CustomJwtToken {
  token: string;
  expiresIn: number;
}

@Injectable()
export class CustomJwtService {
  private readonly secretKey: string;
  private readonly expiresIn: string = '7d';

  constructor() {
    this.secretKey = process.env.JWT_SECRET_KEY || 'your-super-secret-jwt-key-change-this-in-production';
  }

  generateToken(payload: Omit<CustomJwtPayload, 'iat' | 'exp'>): CustomJwtToken {
    const tokenPayload: CustomJwtPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(tokenPayload, this.secretKey, {
      expiresIn: this.expiresIn,
    } as jwt.SignOptions);

    const decoded = jwt.decode(token) as any;
    const expiresIn = decoded.exp - decoded.iat;

    return {
      token,
      expiresIn,
    };
  }

  verifyToken(token: string): CustomJwtPayload {
    try {
      const decoded = jwt.verify(token, this.secretKey) as CustomJwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  refreshToken(token: string): CustomJwtToken {
    const decoded = this.verifyToken(token);
    
    return this.generateToken({
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.emailVerified,
      displayName: decoded.displayName,
      customClaims: decoded.customClaims,
      domain: decoded.domain,
    });
  }
}
