import { FirebaseAuthError } from './firebase-auth.error';

export class UserCreationError extends FirebaseAuthError {
  constructor(message = 'Failed to create user', originalError?: Error) {
    super(message, 'USER_CREATION_FAILED', originalError);
    this.name = 'UserCreationError';
  }
}
