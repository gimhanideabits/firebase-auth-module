export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}

export abstract class AuthError extends BaseError {
  abstract readonly code: string;
  readonly statusCode = 401;
}

export abstract class ValidationError extends BaseError {
  abstract readonly code: string;
  readonly statusCode = 400;
}

export class CustomTokenExchangeError extends AuthError {
  readonly code = 'custom_token_exchange_failed';

  constructor(message: string = 'Custom token exchange failed', originalError?: Error) {
    super(message, originalError);
  }
}

export class CustomTokenInvalidError extends ValidationError {
  readonly code = 'invalid_custom_token';

  constructor(message: string = 'Invalid custom token provided', originalError?: Error) {
    super(message, originalError);
  }
}

export class CustomTokenMissingError extends ValidationError {
  readonly code = 'missing_custom_token';

  constructor(message: string = 'Custom token is required', originalError?: Error) {
    super(message, originalError);
  }
}

export class CustomTokenTypeError extends ValidationError {
  readonly code = 'invalid_token_type';

  constructor(message: string = 'Custom token must be a string', originalError?: Error) {
    super(message, originalError);
  }
}

export class CustomTokenLengthError extends ValidationError {
  readonly code = 'invalid_token_length';

  constructor(message: string = 'Custom token length is invalid', originalError?: Error) {
    super(message, originalError);
  }
}
