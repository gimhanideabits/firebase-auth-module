import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CustomJwtService, CustomJwtPayload } from '../services/custom-jwt.service';

@Injectable()
export class CustomJwtAuthGuard implements CanActivate {
  constructor(private readonly customJwtService: CustomJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authToken = request.cookies?.authToken;
    
    console.log('Auth Cookie:', authToken ? 'Present' : 'Missing');
    
    if (!authToken) {
      throw new UnauthorizedException('No authentication token found');
    }

    console.log('Extracted Token:', authToken.substring(0, 20) + '...');

    try {
      const decodedToken: CustomJwtPayload = this.customJwtService.verifyToken(authToken);
      console.log('Decoded JWT Token:', decodedToken);
      
      request.user = decodedToken;
      return true;
    } catch (error) {
      console.error('JWT verification error:', error);
      throw new UnauthorizedException(`Invalid JWT token: ${error.message}`);
    }
  }
}
