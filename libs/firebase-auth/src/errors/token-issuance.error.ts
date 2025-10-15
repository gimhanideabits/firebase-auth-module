import { FirebaseAuthError } from './firebase-auth.error';

export class TokenIssuanceError extends FirebaseAuthError {
  constructor(message = 'Failed to issue custom token', originalError?: Error) {
    super(message, 'TOKEN_ISSUANCE_FAILED', originalError);
    this.name = 'TokenIssuanceError';
  }
}
