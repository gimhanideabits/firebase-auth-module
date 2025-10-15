import { FirebaseAuthError } from './firebase-auth.error';

export class InsufficientScopeError extends FirebaseAuthError {
  constructor(
    message = 'Token does not contain required scopes',
    public readonly requiredScopes: string[],
    public readonly tokenScopes: string[],
    originalError?: Error
  ) {
    super(message, 'INSUFFICIENT_SCOPE', originalError);
    this.name = 'InsufficientScopeError';
  }
}
