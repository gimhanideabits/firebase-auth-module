import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FirebaseAuthService } from '@app/firebase-auth';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly firebaseAuth: FirebaseAuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);

    try {
      const decodedToken = await this.firebaseAuth.verifyToken(token);
      req['user'] = decodedToken;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
