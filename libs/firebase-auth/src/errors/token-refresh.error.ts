import { FirebaseAuthError } from './firebase-auth.error';

export class TokenRefreshError extends FirebaseAuthError {
  constructor(message = 'Failed to refresh token', originalError?: Error) {
    super(message, 'TOKEN_REFRESH_FAILED', originalError);
    this.name = 'TokenRefreshError';
  }
}
