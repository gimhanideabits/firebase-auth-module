import { Injectable } from '@nestjs/common';
import { FirebaseAuthService } from '@app/firebase-auth';
import { CustomTokenExchangeError } from '../errors/auth.errors';

export interface TokenExchangeResult {
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class TokenExchangeService {
  constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  async exchangeCustomToken(customToken: string): Promise<TokenExchangeResult> {
    try {
      const credentials = await this.firebaseAuthService.getCredentials();
      
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${credentials.webApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new CustomTokenExchangeError(
          `Firebase rejected custom token: ${errorData.error?.message || response.statusText}`,
          new Error(`HTTP ${response.status}: ${response.statusText}`)
        );
      }

      const data = await response.json();
      
      return {
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresIn: parseInt(data.expiresIn) || 3600,
      };
    } catch (error) {
      if (error instanceof CustomTokenExchangeError) {
        throw error;
      }
      throw new CustomTokenExchangeError(
        'Failed to exchange custom token',
        error as Error
      );
    }
  }
}
