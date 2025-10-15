import { FirebaseAuthError } from './firebase-auth.error';

export class TokenVerificationError extends FirebaseAuthError {
  constructor(message = 'Token verification failed', originalError?: Error) {
    super(message, 'TOKEN_VERIFICATION_FAILED', originalError);
    this.name = 'TokenVerificationError';
  }
}
