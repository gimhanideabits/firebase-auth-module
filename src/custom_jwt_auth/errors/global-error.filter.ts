import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BaseError, AuthError, ValidationError } from './auth.errors';

export interface ErrorResponse {
  ok: false;
  message: string;
  errors: Array<{
    code: string;
    error: string;
  }>;
  metadata: {
    request_id: string;
    timestamp: string;
  };
}

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    let errorResponse: ErrorResponse;

    if (exception instanceof BaseError) {
      errorResponse = this.handleCustomError(exception, requestId, timestamp);
    } else if (exception instanceof HttpException) {
      errorResponse = this.handleHttpException(exception, requestId, timestamp);
    } else {
      errorResponse = this.handleUnknownError(exception, requestId, timestamp);
    }

    response.status(errorResponse.errors[0]?.code === 'custom_token_exchange_failed' ? 401 : 
                   errorResponse.errors[0]?.code.startsWith('invalid_') || errorResponse.errors[0]?.code.startsWith('missing_') ? 400 : 500)
           .json(errorResponse);
  }

  private handleCustomError(error: BaseError, requestId: string, timestamp: string): ErrorResponse {
    return {
      ok: false,
      message: this.getErrorMessage(error),
      errors: [{
        code: error.code,
        error: error.message,
      }],
      metadata: {
        request_id: requestId,
        timestamp,
      },
    };
  }

  private handleHttpException(exception: HttpException, requestId: string, timestamp: string): ErrorResponse {
    const status = exception.getStatus();
    const response = exception.getResponse();

    return {
      ok: false,
      message: this.getHttpErrorMessage(status),
      errors: [{
        code: this.getHttpErrorCode(status),
        error: typeof response === 'string' ? response : (response as any).message || 'Unknown error',
      }],
      metadata: {
        request_id: requestId,
        timestamp,
      },
    };
  }

  private handleUnknownError(exception: unknown, requestId: string, timestamp: string): ErrorResponse {
    return {
      ok: false,
      message: 'token exchange failed',
      errors: [{
        code: 'internal_server_error',
        error: 'An unexpected error occurred',
      }],
      metadata: {
        request_id: requestId,
        timestamp,
      },
    };
  }

  private getErrorMessage(error: BaseError): string {
    if (error instanceof AuthError) {
      return 'token exchange failed';
    }
    if (error instanceof ValidationError) {
      return 'token exchange failed';
    }
    return 'token exchange failed';
  }

  private getHttpErrorMessage(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'token exchange failed';
      case HttpStatus.UNAUTHORIZED:
        return 'token exchange failed';
      case HttpStatus.FORBIDDEN:
        return 'token exchange failed';
      case HttpStatus.NOT_FOUND:
        return 'token exchange failed';
      default:
        return 'token exchange failed';
    }
  }

  private getHttpErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'bad_request';
      case HttpStatus.UNAUTHORIZED:
        return 'unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'forbidden';
      case HttpStatus.NOT_FOUND:
        return 'not_found';
      default:
        return 'internal_server_error';
    }
  }

  private generateRequestId(): string {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
      const r = Math.floor(Math.random() * 16);
      return r.toString(16);
    });
  }
}
