import { Injectable } from '@nestjs/common';
import { EnvironmentClientConfigProvider } from '@app/firebase-auth';
import { CustomTokenExchangeError } from '../errors/auth.errors';

export interface RefreshTokenResult {
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class RefreshTokenService {
  constructor(private readonly clientConfigProvider: EnvironmentClientConfigProvider) {}

  async refreshIdToken(refreshToken: string): Promise<RefreshTokenResult> {
    try {
      const config = await this.clientConfigProvider.getClientConfig();
      
      const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new CustomTokenExchangeError(
          `Token refresh failed: ${errorData.error?.message || response.statusText}`,
          new Error(`HTTP ${response.status}: ${response.statusText}`)
        );
      }

      const data = await response.json();
      
      if (!data.id_token || !data.refresh_token) {
        throw new CustomTokenExchangeError('Invalid response from Google: missing tokens');
      }
      
      return {
        idToken: data.id_token,
        refreshToken: data.refresh_token,
        expiresIn: parseInt(data.expires_in, 10) || 3600,
      };
    } catch (error) {
      if (error instanceof CustomTokenExchangeError) {
        throw error;
      }
      throw new CustomTokenExchangeError(
        'Failed to refresh token',
        error as Error
      );
    }
  }
}
