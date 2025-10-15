import { FirebaseAuthError } from './firebase-auth.error';

export class InvalidCredentialsError extends FirebaseAuthError {
  constructor(message = 'Invalid Firebase credentials provided', originalError?: Error) {
    super(message, 'INVALID_CREDENTIALS', originalError);
    this.name = 'InvalidCredentialsError';
  }
}
