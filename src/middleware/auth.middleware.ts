import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FirebaseAuthService } from '@app/firebase-auth';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly firebaseAuth: FirebaseAuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authToken = req.cookies?.authToken;
    
    if (!authToken) {
      throw new UnauthorizedException('No authentication token found');
    }

    try {
      const decodedToken = await this.firebaseAuth.verifyToken(authToken);
      req['user'] = decodedToken;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
