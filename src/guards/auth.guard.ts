import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseAuthService } from '@app/firebase-auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseAuth: FirebaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    console.log('Auth Header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);
    console.log('Extracted Token:', token.substring(0, 20) + '...');

    try {
      const decodedToken = await this.firebaseAuth.verifyToken(token);
      console.log('Decoded Token:', decodedToken);
      
      request.user = decodedToken;
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }
}
