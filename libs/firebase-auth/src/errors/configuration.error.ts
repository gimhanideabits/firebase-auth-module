import { FirebaseAuthError } from './firebase-auth.error';

export class ConfigurationError extends FirebaseAuthError {
  constructor(message = 'Firebase configuration error', originalError?: Error) {
    super(message, 'CONFIGURATION_ERROR', originalError);
    this.name = 'ConfigurationError';
  }
}
