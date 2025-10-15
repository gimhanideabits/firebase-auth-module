import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseAuthService } from '@app/firebase-auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseAuth: FirebaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);

    try {
      const decodedToken = await this.firebaseAuth.verifyToken(token);
      request.user = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
